# frozen_string_literal: true

require 'fastlane/action'
require 'fastlane_core/ui/ui'

UI = FastlaneCore::UI unless defined?(UI)

# Monkey-patch to fix the DEVELOPER_ID_APPLICATION_G2 issue
# See: https://github.com/fastlane/fastlane/pull/20588
module Spaceship
  class ConnectAPI
    class Certificate
      class << self
        # Monkey-patch for listing certificates
        def all(client: nil, filter: {}, includes: nil, limit: nil, sort: nil)
          client ||= Spaceship::ConnectAPI

          # Remove certificateType from filter to avoid server-side error
          certificate_types = filter.delete(:certificateType)

          resps = client.get_certificates(filter: filter, includes: includes, limit: limit, sort: sort).all_pages

          # Manually filter by certificateType on the client-side
          unless certificate_types.nil?
            resps.select! do |resp|
              certificate_types.split(',').include?(resp.certificateType)
            end
          end

          resps.map { |resp| self.new(resp.id, resp) }
        end
      end
    end
  end
end

module CertificateCreatePatch
  def create(client: nil, certificate_type:, csr_content:)
    UI.message("Intercepted certificate creation. Type received: #{certificate_type.inspect} of class #{certificate_type.class}")
    if certificate_type.to_s == 'DEVELOPER_ID_APPLICATION_G2'
      UI.message("Monkey-patching certificateType from DEVELOPER_ID_APPLICATION_G2 to DEVELOPER_ID_APPLICATION")
      certificate_type = 'DEVELOPER_ID_APPLICATION'
    end
    super(client: client, certificate_type: certificate_type, csr_content: csr_content)
  end
end

Spaceship::ConnectAPI::Certificate.singleton_class.prepend(CertificateCreatePatch)
