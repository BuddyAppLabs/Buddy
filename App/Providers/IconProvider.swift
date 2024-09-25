import AVKit
import Combine
import Foundation
import MediaPlayer
import OSLog
import SwiftUI

class IconProvider: NSObject, ObservableObject, SuperLog {
    @Published var iconURL: URL?

    let emoji = "🍒"
        
    func setIconURL(_ i: URL, reason: String = "") {
        self.iconURL = i
    }

    func getIcon() throws -> IconModel? {
        guard let iconURL = iconURL else {
            return nil
        }
        
        return try IconModel.fromJSONFile(iconURL)
    }
}

#Preview {
    AppPreview()
        .frame(width: 800)
        .frame(height: 800)
}
