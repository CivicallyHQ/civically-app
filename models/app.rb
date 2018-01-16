class CivicallyApp::App
  include ActiveModel::SerializerSupport

  attr_accessor :id,
                :name,
                :side,
                :version,
                :authors,
                :url,
                :image_url,
                :user_added,
                :place_category_id,
                :rating_topic

  def initialize(plugin, user = nil)
    metadata = plugin.metadata
    @id = metadata.name.gsub(/_/, '-')
    @name = I18n.t(`#{@id.underscore}.title`)

    if user
      user.left_apps.each do |ua|
        if ua == @id
          @user_added = true
          @side = 'left'
        end
      end

      user.right_apps.each do |ua|
        if ua == @id
          @user_added = true
          @side = 'right'
        end
      end
    end

    @version = metadata.version
    @authors = metadata.authors
    @url = metadata.url
    @image_url = metadata.image_url if metadata.respond_to?(:image_url)

    id_arr = @id.split('_')
    if id_arr[1]
      slug = id_arr[1].split('-')[1]
      category = Category.find_by(slug: slug)
      @place_category_id = category.id
    end

    if rating_topic = Topic.where("id in (
      SELECT topic_id FROM topic_custom_fields WHERE name = 'rating_target_id' AND value = ?
    )", @id)[0]
      @rating_topic = rating_topic
    end
  end
end
