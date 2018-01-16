class CivicallyApp::AppController < ::ApplicationController
  before_action :ensure_logged_in, only: [:place, :user, :create]

  def index
    render nothing: true
  end

  def general
    render_serialized(CivicallyApp::App.general_apps(current_user), CivicallyApp::AppSerializer)
  end

  def place
    render_serialized(CivicallyApp::App.place_apps(current_user), CivicallyApp::AppSerializer)
  end

  def user
    render_serialized(CivicallyApp::App.user_apps(current_user), CivicallyApp::AppSerializer, root: false)
  end

  def add
    params.require(:app)
    params.require(:side)

    result = CivicallyApp::App.add_app(current_user, params[:app], params[:side])

    render json: result
  end

  def remove
    params.require(:app)
    params.require(:side)

    user = current_user
    method = "#{params[:side]}_apps"
    user_app_names = user.public_send(method) if user.respond_to? method

    user.custom_fields[method] = JSON.generate(user_app_names.reject { |a| a === params[:app] })
    user.save!

    render json: success_json
  end

  def save
    user = current_user

    if params[:left_apps]
      user.custom_fields['left_apps'] = JSON.generate(params[:left_apps])
    end

    if params[:right_apps]
      user.custom_fields['right_apps'] = JSON.generate(params[:right_apps])
    end

    user.save!

    render json: success_json
  end

  def details
    params.require(:id)
    app = CivicallyApp::App.all_apps(current_user).select { |a| params[:id] == a.id }
    render_serialized(app[0], CivicallyApp::AppSerializer, root: false)
  end
end
