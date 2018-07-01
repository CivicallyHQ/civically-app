class CivicallyApp::AppSerializer < ApplicationSerializer
  attributes :name,
             :type,
             :version,
             :url,
             :image_url,
             :authors,
             :place_category_id,
             :rating_topic,
             :widget

  def rating_topic
    if defined?(DiscourseRatings) == 'constant' && DiscourseRatings.class == Module
      DiscourseRatings::RatingListSerializer.new(object.rating_topic, scope: scope, root: false).as_json
    else
      nil
    end
  end

  def include_rating_topic?
    object.respond_to?(:rating_topic)
  end
end
