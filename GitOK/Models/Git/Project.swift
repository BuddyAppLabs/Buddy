import Foundation
import SwiftData
import SwiftUI
import OSLog

@Model
final class Project {
    static var verbose = true
    static var orderReverse = [
        SortDescriptor<Project>(\.timestamp, order: .reverse)
    ]
    
    var label: String { "\(Logger.isMain)🌳 Project::" }
    var timestamp: Date
    var url: URL
    
    @Transient
    var git = Git()
    
    var title: String {
        url.lastPathComponent
    }
    
    var path: String {
        url.path
    }
    
    var headCommit: GitCommit {
        GitCommit.headFor(path)
    }
    
    var isGit: Bool {
        git.isGitProject(path: path)
    }
    
    var isNotGit: Bool { !isGit }
    
    init(_ url: URL) {
        self.timestamp = .now
        self.url = url
    }
    
    func getCommits(_ reason: String) -> [GitCommit] {
        if Self.verbose {
            os_log("\(self.label)GetCommit with reason->\(reason)")
        }
        
        do {
            return try git.logs(path)
        } catch let error {
            os_log(.error, "\(self.label)GetCommits has error")
            print(error)
            return []
        }
    }
    
    func getCommitsWithHead(_ reason: String) -> [GitCommit] {
        if Self.verbose {
            os_log("\(self.label)GetCommitWithHead with reason->\(reason)")
        }
        
        return [self.headCommit] + getCommits(reason)
    }
}

extension Project: Identifiable {
    var id: URL {
        self.url
    }
}

#Preview {
    AppPreview()
        .frame(width: 800)
}
