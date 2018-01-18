class CivicallyApp::App
  def self.add_app(user, app, side)
    method = "#{side}_apps"
    user_apps = user.public_send(method) if user.respond_to? method

    if user_apps.include?(app)
      return { reject: true, reason: "App already added" }
    end

    user.custom_fields["#{side}_apps"] = JSON.generate(user_apps.push(app))
    if result = user.save_custom_fields(true)
      return { success: 'OK' }
    else
      return { reject: true, reason: "Failed to add app" }
    end
  end

  def self.remove_app(user, app, side)
    method = "#{side}_apps"
    user_apps = user.public_send(method) if user.respond_to? method

    user.custom_fields[method] = JSON.generate(user_apps.reject { |a| a === app })

    if result = user.save_custom_fields(true)
      return { success: 'OK' }
    else
      return { reject: true, reason: "Failed to remove app" }
    end
  end

  def self.change_side(user, app, side)
    opposite_side = side === 'right' ? 'left' : 'right'
    result = remove_app(user, app, opposite_side)

    if result[:success]
      result = add_app(user, app, side)
    end

    result
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
