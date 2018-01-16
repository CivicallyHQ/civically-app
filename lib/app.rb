class CivicallyApp::App
  def self.add_app(user, app, side)
    method = "#{side}_apps"
    user_apps = user.public_send(method) if user.respond_to? method

    if user_apps.find { |a| a['id'] == app }
      return { reject: true, reason: "App already added" }
    end

    user.custom_fields["#{side}_apps"] = JSON.generate(user_apps.push(app))
    user.save!

    return { success: 'OK' }
  end

  def self.all_plugins
    Plugin::Instance.find_all("#{Rails.root}/plugins")
  end

  def self.all_apps(user)
    all_plugins.select { |p| p.metadata.app }.map { |p| CivicallyApp::App.new(p, user) }
  end

  def self.general_apps(user)
    all_apps(user).select { |a| !a.place_category_id }
  end

  def self.place_apps(user)
    all_apps(user).select { |a| a.place_category_id.to_i === user.custom_fields['place_category_id'].to_i }
  end

  def self.user_apps(user)
    all_apps(user).select { |a| a.user_added === true }
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
        petition_type: 'app',
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
