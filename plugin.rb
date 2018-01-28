# name: civically-app
# about: Base plugin for Civically apps
# version: 0.1
# authors: angus
# url: https://github.com/civicallyhq/civically-app

register_asset 'stylesheets/civically-app.scss'

DiscourseEvent.on(:civically_site_ready) do
  unless SiteSetting.app_petition_category_id.to_i > 1
    category = Category.create(
      user: Discourse.system_user,
      name: 'App',
      color: SecureRandom.hex(3),
      permissions: { everyone: 2 },
      allow_badges: true,
      text_color: 'FFFFF',
      topic_id: -1,
      topic_featured_link_allowed: true,
      parent_category_id: SiteSetting.petition_category_id,
      custom_fields: {
        'meta': true,
        'enable_topic_voting': "true",
        'petition_enabled': true,
        'petition_vote_threshold': 100,
        'tl0_vote_limit': 1,
        'tl1_vote_limit': 1,
        'tl2_vote_limit': 1,
        'tl3_vote_limit': 1,
        'tl4_vote_limit': 1
      }
    )

    SiteSetting.app_petition_category_id = category.id
  end

  unless SiteSetting.app_category_id.to_i > 1
    category = Category.create(
      user: Discourse.system_user,
      name: 'Apps',
      color: SecureRandom.hex(3),
      permissions: { everyone: 2 },
      allow_badges: true,
      text_color: 'FFFFF',
      topic_id: -1,
      topic_featured_link_allowed: true,
      custom_fields: {
        'meta': true,
        'rating_enabled': true,
        'topic_types': 'rating'
      }
    )

    if category.save
      SiteSetting.app_category_id = category.id

      t = Topic.new(
        title: I18n.t("about_apps.title"),
        user: Discourse.system_user,
        pinned_at: Time.now,
        category_id: category.id
      )
      t.skip_callbacks = true
      t.ignore_category_auto_close = true
      t.delete_topic_timer(TopicTimer.types[:close])
      t.save!(validate: false)

      category.topic_id = t.id
      category.save!

      t.posts.create(
        raw: I18n.t('about_apps.body'),
        user: Discourse.system_user
      )
    end
  end
end

DiscourseEvent.on(:custom_wizard_ready) do
  unless PluginStoreRow.exists?(plugin_name: 'custom_wizard', key: 'app_petition')
    CustomWizard::Wizard.add_wizard(File.read(File.join(
      Rails.root, 'plugins', 'civically-app', 'config', 'wizards', 'app_petition.json'
    )))
  end

  CustomWizard::Builder.add_step_handler('app_petition') do |builder|
    if builder.updater && builder.updater.step && builder.updater.step.id === 'repository'
      updater = builder.updater
      uri = URI.parse(updater.fields['repository_url'])

      unless %w( http https ).include?(uri.scheme)
        updater.errors.add(:repository_url, I18n.t('app.petition.repository.error.invalid'))
      end

      unless updater.errors.any?
        if uri.host != 'github.com' && uri.host != 'bitbucket.org'
          updater.errors.add(:repository_url, I18n.t('app.petition.repository.error.wrong_host'))
        end

        unless updater.errors.any?
          http = Net::HTTP.new(uri.host, uri.port)
          http.use_ssl = true
          unless http.request_head(uri.path).kind_of? Net::HTTPSuccess
            updater.errors.add(:repository_url, I18n.t('app.petition.repository.error.not_available'))
          end

          unless updater.errors.any?
            if topic = Topic.where(featured_link: uri.to_s).first
              updater.errors.add(:repository_url, I18n.t('app.petition.repository.error.duplicate', url: topic.url, title: topic.title))
            end
          end
        end
      end
    end

    if builder.updater && builder.updater.step && builder.updater.step.id === 'name'
      updater = builder.updater
      name = updater.fields['input']
      if topic = Topic.where(category_id: SiteSetting.app_petition_category_id, title: name).first
        updater.errors.add(:input, I18n.t('app.petition.name.error.identical', url: topic.url, title: topic.title))
      end
    end

    if builder.updater && builder.updater.step && builder.updater.step.id === 'submit'
      updater = builder.updater
      submission = builder.submissions.last || {}
      user = builder.wizard.user

      updater.errors.add(:app_petition, I18n.t('app.petition.repository.url.error')) if !submission[:repository_url]
      updater.errors.add(:app_petition, I18n.t('app.petition.details.name.error')) if !submission[:name]
      updater.errors.add(:app_petition, I18n.t('app.petition.details.post.error')) if !submission[:post]

      unless updater.errors.any?
        params = {
          name: submission[:name],
          post: submission[:post],
          repository_url: submission[:repository_url]
        }

        if submission[:category_id]
          params[:app_category_id] = submission[:category_id].to_i if submission[:category_id].to_i > 0
        end

        result = CivicallyApp::App.create_petition_topic(user, params)

        if result.errors.any?
          updater.errors.add(:app_petition, result.errors.full_messages.join("\n"))
        else
          updater.result = { redirect_to: result.post.url }
        end
      end
    end
  end
end

DiscourseEvent.on(:petition_ready) do
  CivicallyPetition::Petition.add_resolution('app') do |topic, forced|
    status = topic.custom_fields['petition_status']

    if status === 'accepted'
      if app_category_id = topic.custom_fields['app_category_id']
        topic.category_id = app_category_id
      else
        topic.category_id = SiteSetting.app_category_id
      end

      topic.custom_fields.delete('petition')
      topic.custom_fields.delete('petition_type')
      topic.custom_fields.delete('petition_status')
      topic.subtype = 'rating'
    end

    if status === 'rejected'
      topic.closed = true
    end

    topic.save!

    { reload: true }
  end
end

after_initialize do
  add_to_serializer(:current_user, :left_apps) { object.left_apps }
  add_to_serializer(:current_user, :right_apps) { object.right_apps }

  class Plugin::Metadata
    attr_accessor :id, :image_url, :title, :app, :default
    core_fields = FIELDS
    remove_const(:FIELDS)
    FIELDS = core_fields + [:id, :image_url, :title, :app, :default]
  end

  require_dependency "application_controller"
  module ::CivicallyApp
    class Engine < ::Rails::Engine
      engine_name "civically-app"
      isolate_namespace CivicallyApp
    end
  end

  CivicallyApp::Engine.routes.draw do
    get "" => "app#index"
    get "store" => "app#index"
    get "store/general" => "app#general"
    get "store/place" => "app#place"
    get "user" => "app#user"
    get "details/:id" => "app#details"
    get "submit" => "app#index"
    get "validate_repository" => "app#validate_repository"
    post "create" => "app#create"
    post "add" => "app#add"
    post "remove" => "app#remove"
    post "change_side" => "app#change_side"
    post "save" => "app#save"
  end

  Discourse::Application.routes.append do
    mount ::CivicallyApp::Engine, at: "app"
    %w{users u}.each_with_index do |root_path, index|
      get "#{root_path}/:username/apps" => "users#show", constraints: { username: USERNAME_ROUTE_FORMAT }
    end
  end

  load File.expand_path('../models/app.rb', __FILE__)
  load File.expand_path('../controllers/app.rb', __FILE__)
  load File.expand_path('../serializers/app.rb', __FILE__)
  load File.expand_path('../lib/app.rb', __FILE__)

  class Plugin::Instance
    attr_accessor :user_added
  end

  require_dependency 'user'
  class ::User
    def left_apps
      if self.custom_fields["left_apps"]
        JSON.parse(self.custom_fields["left_apps"])
      else
        []
      end
    end

    def right_apps
      if self.custom_fields["right_apps"]
        JSON.parse(self.custom_fields["right_apps"])
      else
        []
      end
    end
  end
end
