APPS_WITH_NO_HEADER = ['civically-navigation', 'civically-place']

class CivicallyApp::App
  include ActiveModel::SerializerSupport

  attr_accessor :name,
                :type,
                :version,
                :authors,
                :url,
                :image_url,
                :place_category_id,
                :rating_topic,
                :widget

  def initialize(plugin)
    @metadata = plugin.metadata
    @name = plugin.metadata.name
    @type = plugin.metadata.app
    @version = plugin.metadata.version
    @authors = plugin.metadata.authors
    @url = plugin.metadata.url
  end

  def place_category_id
    name_arr = @metadata.name.split('_')
    place = name_arr[1]

    if place
      slug_arr = place.split('-')

      country_slug = slug_arr.first
      town_slug = slug_arr.last

      if category = Category.find_by_slug(town_slug, country_slug)
        category.id
      end
    end
  end

  def image_url
    if @metadata.respond_to?(:image_url)
      @metadata.image_url
    else
      SiteSetting.default_app_image_url
    end
  end

  def rating_topic
    Topic.where("id in (
      SELECT topic_id FROM topic_custom_fields WHERE name = 'rating_target_id' AND value = ?
    )", @name)[0]
  end

  def widget
    widget = {}

    if APPS_WITH_NO_HEADER.include?(@name)
      widget[:no_header] = true
    end

    widget
  end

  def self.all_plugins
    Plugin::Instance.find_all("#{Rails.root}/plugins")
  end

  def self.all_apps
    @all_apps ||= all_plugins.select { |p| p.metadata.app.present? }.map { |p| CivicallyApp::App.new(p) }
  end

  def self.external_apps
    @external_apps ||= all_apps.select { |a| a.type === 'external' }
  end

  def self.general_apps
    @general_apps ||= external_apps.select { |a| !a.place_category_id }
  end

  def self.place_apps(user)
    @place_apps ||= external_apps.select { |a| a.place_category_id.to_i === user.custom_fields['place_category_id'].to_i }
  end

  def self.user_apps(user)
    @user_apps ||= all_apps.select { |a| user.custom_fields[a.name].present? }
  end

  def self.user_app_data(user)
    user.custom_fields.select do |k, v|
      self.user_apps(user).map(&:name).include?(k)
    end.map do |k, v|
      [k, JSON.parse(v)]
    end.to_h
  end

  def self.find(name)
    self.all_apps.select { |a| a.name === name }
  end

  def self.add(user, app_name, app_data)
    if user.custom_fields[app_name]
      return { reject: true, reason: "App already added" }
    end

    app_data[:enabled] = false if app_data[:enabled].blank?
    app_data[:widget] = { position: 'left' } if app_data[:widget].blank?

    UserCustomField.transaction do
      user.custom_fields[app_name] = JSON.generate(app_data)

      widget_field_name = "app_widgets_#{app_data[:widget][:position]}".freeze
      widgets = user.send(widget_field_name)

      user.custom_fields[widget_field_name] = widgets.push(app_name)

      user.save_custom_fields(true)
    end

    user.app_data
  end

  def self.remove(user, app_name)
    app = self.find(app_name)

    if app.type === 'system'
      return { reject: true, reason: "Cannot remove system app" }
    end

    UserCustomField.transaction do
      UserCustomField.delete_all(user_id: user_id, name: app_name)

      widget_field_name = "app_widgets_#{app[:widget_position]}".freeze
      widgets = user.send(widget_field_name)

      user.custom_fields[widget_field_name] = widgets - [app_name]

      user.save_custom_fields(true)
    end

    { success: 'OK' }
  end

  def self.update_data(user, app_name, app_data)
    unless self.find(app_name).any?
      return { reject: true, reason: "App does not exist" }
    end

    existing_data = user.app_data[app_name] || {}

    new_data = existing_data.with_indifferent_access
      .merge(app_data.with_indifferent_access)

    user.custom_fields[app_name] = JSON.generate(new_data)

    if user.save_custom_fields(true)
      user.app_data[app_name]
    else
      { reject: true, reason: "Failed to update app data" }
    end
  end

  def self.create_petition_topic(user, opts)
    category_id = opts[:app_category_id] || SiteSetting.app_petition_category_id

    topic_params = {
      title: opts[:name],
      category: category_id,
      featured_link: opts[:repository_url],
      skip_validations: true,
      topic_custom_fields: {
        subtype: 'voting',
        petition: true,
        petition_id: 'app',
        petition_status: 'open'
      }
    }

    result = TopicCreator.create(user, Guardian.new(user), topic_params)

    if result.errors.any?
      raise StandardError.new I18n.t('app.error.failed_to_create_petition_topic', errors: result.errors)
    else
      manager = NewPostManager.new(user,
        raw: opts[:post],
        topic_id: result.id,
        skip_validations: true
      )

      result = manager.perform
    end

    result
  end
end
