PERMITTED_DATA_ATTRIBUTES = [
  :enabled
]

class CivicallyApp::AppController < ::ApplicationController
  before_action :ensure_logged_in, only: [:place, :user, :create]

  def index
    render nothing: true
  end

  def general
    render_serialized(CivicallyApp::App.general_apps, CivicallyApp::AppSerializer)
  end

  def place
    render_serialized(CivicallyApp::App.place_apps(current_user), CivicallyApp::AppSerializer)
  end

  def user
    render_serialized(CivicallyApp::App.user_apps(current_user), CivicallyApp::AppSerializer)
  end

  def add
    user = app_user
    app_data = CivicallyApp::App.add(user, app_params[:name], app_data)
    render json: success_json.merge(app_data: app_data)
  end

  def remove
    user = app_user
    result = CivicallyApp::App.remove(user, app_params[:name])
    render json: result
  end

  def update_data
    user = app_user
    app_data = CivicallyApp::App.update_data(user, app_params[:name], app_data)
    render json: success_json.merge(app_data: app_data)
  end

  def details
    params.require(:name)
    app = CivicallyApp::App.all_apps.select { |a| params[:name] == a.name }
    render_serialized(app[0], CivicallyApp::AppSerializer, root: false)
  end

  def app_user
    params.require(:user_id)
    User.find(params[:user_id])
  end

  def app_params
    permitted_params = PERMITTED_DATA_ATTRIBUTES + [:name, widget: [:position]]
    params.require(:app).permit(permitted_params)
  end

  def app_data
    app_params.to_h.slice(*PERMITTED_DATA_ATTRIBUTES)
  end
end
