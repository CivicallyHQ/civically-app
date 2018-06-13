DiscourseEvent.on(:custom_wizard_ready) do
  if !CustomWizard::Wizard.find('app_petition') || Rails.env.development?
    CustomWizard::Wizard.add_wizard(File.read(File.join(
      Rails.root, 'plugins', 'civically-app', 'config', 'wizards', 'app_petition.json'
    )))
  end

  CustomWizard::Builder.add_step_handler('app_petition') do |builder|
    if builder.updater && builder.updater.step && builder.updater.step.id === 'repository'
      updater = builder.updater
      uri = URI.parse(updater.fields['repository_url'])

      unless %w( http https ).include?(uri.scheme)
        updater.errors.add(:repository_url, I18n.t('app.petition.repository.error.invalid'))
      end

      unless updater.errors.any?
        if uri.host != 'github.com' && uri.host != 'bitbucket.org'
          updater.errors.add(:repository_url, I18n.t('app.petition.repository.error.wrong_host'))
        end

        unless updater.errors.any?
          http = Net::HTTP.new(uri.host, uri.port)
          http.use_ssl = true

          unless http.request_head(uri.path).kind_of? Net::HTTPSuccess
            updater.errors.add(:repository_url, I18n.t('app.petition.repository.error.not_available'))
          end

          unless updater.errors.any?
            if topic = Topic.where(featured_link: uri.to_s).first
              updater.errors.add(:repository_url, I18n.t('app.petition.repository.error.duplicate', url: topic.url, title: topic.title))
            end
          end
        end
      end
    end

    if builder.updater && builder.updater.step && builder.updater.step.id === 'name'
      updater = builder.updater
      name = updater.fields['input']
      if topic = Topic.where(category_id: SiteSetting.app_petition_category_id, title: name).first
        updater.errors.add(:input, I18n.t('app.petition.name.error.identical', url: topic.url, title: topic.title))
      end
    end

    if builder.updater && builder.updater.step && builder.updater.step.id === 'submit'
      updater = builder.updater
      submission = builder.submissions.last || {}
      user = builder.wizard.user

      updater.errors.add(:app_petition, I18n.t('app.petition.repository.url.error')) if !submission[:repository_url]
      updater.errors.add(:app_petition, I18n.t('app.petition.details.name.error')) if !submission[:name]
      updater.errors.add(:app_petition, I18n.t('app.petition.details.post.error')) if !submission[:post]

      unless updater.errors.any?
        params = {
          name: submission[:name],
          post: submission[:post],
          repository_url: submission[:repository_url]
        }

        if submission[:category_id]
          params[:app_category_id] = submission[:category_id].to_i if submission[:category_id].to_i > 0
        end

        category_id = params[:app_category_id] || SiteSetting.app_petition_category_id

        petition = CivicallyPetition::Petition.create(user,
          title: params[:name],
          id: 'app',
          category: category_id,
          featured_link: params[:repository_url],
        )

        if petition.errors.any?
          raise StandardError.new I18n.t('app.error.failed_to_create_petition_topic', errors: petition.errors)
        end

        manager = NewPostManager.new(user,
          raw: params[:post],
          topic_id: petition.id,
          skip_validations: true
        )

        result = manager.perform

        if result.errors.any?
          updater.errors.add(:app_petition, result.errors.full_messages.join("\n"))
        else
          updater.result = { redirect_to: result.post.url }
        end
      end
    end
  end
end

DiscourseEvent.on(:petition_ready) do
  CivicallyPetition::Petition.add_resolution('app') do |topic, forced|
    status = topic.custom_fields['petition_status']

    if status === 'accepted'
      if topic.category_id = SiteSetting.app_petition_category_id
        topic.category_id = SiteSetting.app_category_id
      end

      topic.custom_fields.delete('petition')
      topic.custom_fields.delete('petition_id')
      topic.custom_fields.delete('petition_status')
      topic.subtype = 'rating'
    end

    if status === 'rejected'
      topic.closed = true
    end

    topic.save!

    { reload: true }
  end
end
