PERMITTED_ATTRIBUTES = [
  :name,
  :enabled,
  widget: [
    :position,
    :order
  ]
]

class CivicallyApp::AppController < ::ApplicationController
  before_action :ensure_logged_in, only: [:town, :user, :add, :remove, :update]
  before_action :find_user, only: [:add, :remove, :update, :batch_update]

  attr_accessor :user

  def index
    render nothing: true
  end

  def general
    render_serialized(CivicallyApp::App.general_apps, CivicallyApp::AppSerializer)
  end

  def town
    render_serialized(CivicallyApp::App.town_apps(current_user), CivicallyApp::AppSerializer)
  end

  def user
    render_serialized(CivicallyApp::App.user_apps(current_user), CivicallyApp::AppSerializer)
  end

  def details
    params.require(:name)
    app = CivicallyApp::App.all_apps.select { |a| params[:name] == a.name }
    render_serialized(app[0], CivicallyApp::AppSerializer, root: false)
  end

  def add
    result = CivicallyApp::App.add(@user, app_params[:name], app_params.except(:name).to_h)
    app_responder(result)
  end

  def remove
    result = CivicallyApp::App.remove(@user, app_params[:name])
    app_responder(result)
  end

  def update
    result = CivicallyApp::App.update(@user, app_params[:name], app_params.except(:name).to_h)
    app_responder(result)
  end

  def batch_update
    result = CivicallyApp::App.batch_update(@user, batch_params[:apps])
    app_responder(result)
  end

  def app_responder(result)
    if result[:success]
      render json: success_json.merge(result)
    elsif result[:error]
      render_json_error(result[:reason])
    else
      render_json_error(I18n.t('app.error.default'))
    end
  end

  def find_user
    params.require(:user_id)
    @user = User.find(params[:user_id])
    raise Discourse::NotFound if @user.nil?
  end

  def app_params
    params.require(:app).permit(PERMITTED_ATTRIBUTES)
  end

  def batch_params
    params.permit(apps: [PERMITTED_ATTRIBUTES])
  end
end
