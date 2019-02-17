require_dependency "application_controller"
module ::CivicallyApp
  class Engine < ::Rails::Engine
    engine_name "civically-app"
    isolate_namespace CivicallyApp
  end
end

CivicallyApp::Engine.routes.draw do
  get "" => "app#index"
  get "store" => "app#index"
  get "store/general" => "app#general"
  get "store/town" => "app#town"
  get "store/neighbourhood" => "app#neighbourhood"
  get "user" => "app#user"
  get "details/:name" => "app#details"
  get "submit" => "app#index"
  get "validate_repository" => "app#validate_repository"
  post "create" => "app#create"
  post "add" => "app#add"
  post "remove" => "app#remove"
  post "update" => "app#update"
  post "batch-update" => "app#batch_update"
end

Discourse::Application.routes.append do
  mount ::CivicallyApp::Engine, at: "app"
  %w{users u}.each_with_index do |root_path, index|
    get "#{root_path}/:username/apps" => "users#show", constraints: { username: USERNAME_ROUTE_FORMAT }
  end
end
