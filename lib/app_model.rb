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
    @name = plugin.metadata.name.dasherize
    @type = plugin.metadata.app
    @version = plugin.metadata.version
    @authors = plugin.metadata.authors
    @url = plugin.metadata.url
  end

  def place_category_id
    name_arr = @metadata.name.split('_')
    category = nil

    if name_arr.length > 1
      place_slugs = name_arr.drop(1)

      country_slug = place_slugs[0]
      town_slug = nil
      neighbourhood_slug = nil

      if place_slugs.length > 1
        town_slug = place_slugs[1]

        if place_slugs.length > 2
          neighbourhood_slug = place_slugs[2]
        end
      end

      if neighbourhood_slug
        category = Category.find_by_slug(neighbourhood_slug, town_slug, country_slug)
      elsif town_slug
        category = Category.find_by_slug(town_slug, country_slug)
      else
        category = Category.find_by_slug(country_slug)
      end
    end

    category ? category.id : nil
  end

  def image_url
    if @metadata.respond_to?(:image_url) && @metadata.image_url
      if @metadata.image_url =~ %r{\Ahttps?://}i
        @metadata.image_url
      else
        "#{Discourse.base_url}#{@metadata.image_url}"
      end
    else
      "#{Discourse.base_url}#{SiteSetting.app_default_image_url}"
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

  def self.store_apps
    @store_apps ||= all_apps.select { |a| a.type === 'store' }
  end

  def self.general_apps
    @general_apps ||= store_apps.select { |a| !a.place_category_id }
  end

  def self.town_apps(user)
    @town_apps ||= store_apps.select { |a| a.place_category_id.to_i === user.custom_fields['town_category_id'].to_i }
  end

  def self.neighbourhood_apps(user)
    @neighbourhood_apps ||= store_apps.select { |a| a.place_category_id.to_i === user.custom_fields['neighbourhood_category_id'].to_i }
  end

  def self.user_apps(user)
    all_apps.select { |a| user.custom_fields[a.name].present? }
  end

  def self.user_app_data(user)
    user.custom_fields.select do |k, v|
      self.user_apps(user).map(&:name).include?(k)
    end.map do |k, v|
      [k, JSON.parse(v)]
    end.to_h
  end

  def self.find(name)
    self.all_apps.find { |a| a.name === name }
  end

  def self.app_exists(app_name)
    self.find(app_name).present?
  end

  def self.user_position_widgets(user, position)
    self.user_app_data(user).select do |k, v|
      widget = k['widget']
      widget.present? &&
      widget['position'].present? &&
      widget['order'].present? &&
      widget['position'] == position
    end.sort_by { |k, v| v['widget']['order'].to_i }.to_h
      .map { |k, v| k }
  end

  def self.next_in_position(user, position)

  end

  def self.add(user, app_name, app_data)

    unless self.app_exists(app_name)
      return { error: true, reason: "App does not exist" }
    end

    if user.custom_fields[app_name]
      return { error: true, reason: "App already added" }
    end

    if widget = app_data['widget']
      widget['position'] = 'left' if !widget['position']

      if !widget['order']
        position_widgets = user_position_widgets(user, widget['position'])
        widget['order'] = position_widgets.length
      end
    end

    user.custom_fields[app_name] = JSON.generate(app_data)

    if user.save_custom_fields(true)
      { success: true, app_data: user.app_data[app_name] }
    else
      { error: true, reason: "Failed to add app" }
    end
  end

  def self.remove(user, app_name)
    app = self.find(app_name)

    if app.type === 'system'
      return { error: true, reason: "Cannot remove system app" }
    end

    unless user.custom_fields[app.name]
      return { error: true, reason: "User has not added app" }
    end

    UserCustomField.where(user_id: user.id, name: app.name).delete_all

    { success: true, app_name: app.name }
  end

  def self.update(user, app_name, app_data, save = true)

    unless app_exists(app_name)
      return { error: true, reason: "App does not exist" }
    end

    unless user.custom_fields[app_name]
      return { error: true, reason: "User has not added app" }
    end

    widget_data = app_data.with_indifferent_access[:widget]
    app_data = app_data.except(:widget) if widget_data

    existing_app_data = user.app_data[app_name] || {}
    existing_widget_data = existing_app_data.with_indifferent_access[:widget]

    new_data = existing_app_data.with_indifferent_access
      .merge(app_data.with_indifferent_access)

    if widget_data && existing_widget_data
      new_data[:widget] = existing_widget_data.with_indifferent_access
        .merge(widget_data.with_indifferent_access)
    elsif widget_data
      new_data[:widget] = widget_data
    end

    user.custom_fields[app_name] = JSON.generate(new_data)

    return user if !save

    if user.save_custom_fields(true)
      { success: true, app_data: new_data }
    else
      { error: true, reason: "Failed to update app data" }
    end
  end

  def self.batch_update(user, apps)
    results = {}

    UserCustomField.transaction do
      apps.each do |a|
        app = a.to_h
        results[app[:name]] = self.update(user, app[:name], app.except(:name))
      end
    end

    errors = []
    results.each do |app_name, result|
      if result[:error]
        errors.push(app: app_name, reason: result[:reason])
      end
    end

    if errors.any?
      { error: true, errors: errors }
    else
      { success: true, apps: results }
    end
  end
end
