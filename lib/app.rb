class CivicallyApp::App
  def self.add(user, app, data = nil)
    if user.custom_fields[app]
      return { reject: true, reason: "App already added" }
    end

    user.custom_fields[app] = JSON.generate(data)

    if user.save_custom_fields(true)
      return { success: 'OK' }
    else
      return { reject: true, reason: "Failed to add app" }
    end
  end

  def self.remove(user, app)
    if UserCustomField.delete_all(name: app, user_id: user.id)
      return { success: 'OK' }
    else
      return { reject: true, reason: "Failed to remove app" }
    end
  end

  def self.update(user, app, data)
    existing = user.custom_fields[app] || {}

    user.custom_fields[app] = JSON.generate(existing.merge(data))

    if user.save_custom_fields(true)
      return { success: 'OK' }
    else
      return { reject: true, reason: "Failed to update app data" }
    end
  end

  def self.all_plugins
    Plugin::Instance.find_all("#{Rails.root}/plugins")
  end

  def self.all_apps
    @all_apps ||= all_plugins.select { |p| p.metadata.app.present? }.map { |p| CivicallyApp::App.new(p) }
  end

  def self.general_apps
    @all_apps.select { |a| !a.place_category_id }
  end

  def self.place_apps(user)
    @all_apps.select { |a| a.place_category_id.to_i === user.custom_fields['place_category_id'].to_i }
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
