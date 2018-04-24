# name: civically-app
# about: Base plugin for Civically apps
# version: 0.1
# authors: angus
# url: https://github.com/civicallyhq/civically-app

register_asset 'stylesheets/common/civically-app.scss'
register_asset 'stylesheets/common/civically-app-widget.scss'

load File.expand_path('../lib/app_wizard_and_petition.rb', __FILE__)

after_initialize do
  load File.expand_path('../lib/app_engine_and_routes.rb', __FILE__)
  load File.expand_path('../lib/app_model.rb', __FILE__)
  load File.expand_path('../controllers/app.rb', __FILE__)
  load File.expand_path('../serializers/app.rb', __FILE__)

  class Plugin::Instance
    attr_accessor :added
  end

  class Plugin::Metadata
    attr_accessor :name, :image_url, :title, :app, :default
    core_fields = FIELDS
    remove_const(:FIELDS)
    FIELDS = core_fields + [:name, :image_url, :title, :app, :default]
  end

  require_dependency 'user'
  class ::User
    def app_data
      @app_data ||= CivicallyApp::App.user_app_data(self)
    end
  end

  add_to_serializer(:current_user, :app_data) { object.app_data }

  add_to_serializer(:site, :apps) {
    ActiveModel::ArraySerializer.new(CivicallyApp::App.all_apps, each_serializer: CivicallyApp::AppSerializer).as_json
  }
end
