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

  def add
    params.require(:name)
    params.require(:side)

    result = CivicallyApp::App.add(current_user, params[:name], params[:side], true)

    render json: result
  end

  def remove
    params.require(:name)
    params.require(:side)

    result = CivicallyApp::App.remove_app(current_user, params[:name], params[:side])

    render json: result
  end

  def save
    params.require(:apps)

    user = current_user
    user.custom_fields['apps'] = JSON.generate(params[:apps])
    user.save_custom_fields(true)

    render json: success_json
  end

  def details
    params.require(:name)
    app = CivicallyApp::App.all_apps.select { |a| params[:name] == a.name }
    render_serialized(app[0], CivicallyApp::AppSerializer, root: false)
  end
end
