class CivicallyApp::App
  include ActiveModel::SerializerSupport

  attr_accessor :name,
                :version,
                :authors,
                :default,
                :url,
                :image_url,
                :place_category_id,
                :rating_topic

  def initialize(plugin)
    metadata = plugin.metadata
    @name = metadata.name
    @default = SiteSetting.app_default.include? metadata.app
    @version = metadata.version
    @authors = metadata.authors
    @url = metadata.url
    @image_url = metadata.image_url if metadata.respond_to?(:image_url)

    name_arr = metadata.name.split('_')
    place = name_arr[1]
    if place
      slug_arr = place.split('-')

      country_slug = slug_arr.first
      town_slug = slug_arr.last

      if category = Category.find_by_slug(town_slug, country_slug)
        @place_category_id = category.id
      end
    end

    if rating_topic = Topic.where("id in (
      SELECT topic_id FROM topic_custom_fields WHERE name = 'rating_target_id' AND value = ?
    )", @name)[0]
      @rating_topic = rating_topic
    end
  end
end
