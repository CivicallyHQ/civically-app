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
end
