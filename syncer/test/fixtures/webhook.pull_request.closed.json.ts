import {PullRequestClosedEvent} from '@octokit/webhooks-types';

export default {
  'action': 'closed',
  'number': 12,
  'pull_request': {
    'url': 'https://api.github.com/repos/danielrozenberg/amphtml/pulls/12',
    'id': 749325385,
    'node_id': 'PR_kwDOBihogs4sqcxJ',
    'html_url': 'https://github.com/danielrozenberg/amphtml/pull/12',
    'diff_url': 'https://github.com/danielrozenberg/amphtml/pull/12.diff',
    'patch_url': 'https://github.com/danielrozenberg/amphtml/pull/12.patch',
    'issue_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/issues/12',
    'number': 12,
    'state': 'closed',
    'locked': false,
    'title': 'Update client-side-experiments-config.json',
    'user': {
      'login': 'danielrozenberg',
      'id': 1839738,
      'node_id': 'MDQ6VXNlcjE4Mzk3Mzg=',
      'avatar_url': 'https://avatars.githubusercontent.com/u/1839738?v=4',
      'gravatar_id': '',
      'url': 'https://api.github.com/users/danielrozenberg',
      'html_url': 'https://github.com/danielrozenberg',
      'followers_url': 'https://api.github.com/users/danielrozenberg/followers',
      'following_url':
        'https://api.github.com/users/danielrozenberg/following{/other_user}',
      'gists_url':
        'https://api.github.com/users/danielrozenberg/gists{/gist_id}',
      'starred_url':
        'https://api.github.com/users/danielrozenberg/starred{/owner}{/repo}',
      'subscriptions_url':
        'https://api.github.com/users/danielrozenberg/subscriptions',
      'organizations_url': 'https://api.github.com/users/danielrozenberg/orgs',
      'repos_url': 'https://api.github.com/users/danielrozenberg/repos',
      'events_url':
        'https://api.github.com/users/danielrozenberg/events{/privacy}',
      'received_events_url':
        'https://api.github.com/users/danielrozenberg/received_events',
      'type': 'User',
      'site_admin': false,
    },
    'body':
      '<!--\r\n# Instructions:\r\n\r\n1. Pick a meaningful title for your pull request.\r\n  a. Prefix the title with an emoji. (Copy-paste from the list below.)\r\n  b. If helpful, use a short prefix (e.g. `[Project XX] Implement feature YY`).\r\n2. Enter a description that explains why the PR is necessary, and what it does.\r\n  a. Mention the GitHub issue being addressed by this pull request.\r\n  b. Use keywords to auto-close linked issues during merge. (e.g. `Fixes #11111`, or `Closes #22222`)\r\n3. For substantial changes, first file an Intent-to-Implement (I2I) issue at go.amp.dev/i2i.\r\n\r\n# References:\r\n\r\n- AMP code contribution docs: go.amp.dev/contribute/code\r\n- First time setup (required for CI checks): go.amp.dev/getting-started\r\n\r\n# Emojis for categorizing pull requests (copy-paste emoji into description):\r\n\r\n✨ New feature\r\n🐛 Bug fix\r\n🔥 P0 fix\r\n✅ Tests\r\n❄️ Flaky tests\r\n🚀 Performance improvements\r\n🖍 CSS / Styling\r\n♿ Accessibility\r\n🌐 Internationalization\r\n📖 Documentation\r\n🏗 Infrastructure / Tooling / Builds / CI\r\n⏪ Revert\r\n♻️ Refactor\r\n🚮 Deletion\r\n🧪 Experimental code\r\n-->\r\n',
    'created_at': '2021-10-04T21:32:45Z',
    'updated_at': '2021-10-04T21:32:49Z',
    'closed_at': '2021-10-04T21:32:49Z',
    'merged_at': '2021-10-04T21:32:48Z',
    'merge_commit_sha': 'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
    'assignee': null,
    'assignees': [],
    'requested_reviewers': [],
    'requested_teams': [],
    'labels': [],
    'milestone': null,
    'draft': false,
    'commits_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/pulls/12/commits',
    'review_comments_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/pulls/12/comments',
    'review_comment_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/pulls/comments{/number}',
    'comments_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/issues/12/comments',
    'statuses_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/statuses/3f1af58d70044a996606907d9a221b885d8954a1',
    'head': {
      'label': 'danielrozenberg:danielrozenberg-patch-9',
      'ref': 'danielrozenberg-patch-9',
      'sha': '3f1af58d70044a996606907d9a221b885d8954a1',
      'user': {
        'login': 'danielrozenberg',
        'id': 1839738,
        'node_id': 'MDQ6VXNlcjE4Mzk3Mzg=',
        'avatar_url': 'https://avatars.githubusercontent.com/u/1839738?v=4',
        'gravatar_id': '',
        'url': 'https://api.github.com/users/danielrozenberg',
        'html_url': 'https://github.com/danielrozenberg',
        'followers_url':
          'https://api.github.com/users/danielrozenberg/followers',
        'following_url':
          'https://api.github.com/users/danielrozenberg/following{/other_user}',
        'gists_url':
          'https://api.github.com/users/danielrozenberg/gists{/gist_id}',
        'starred_url':
          'https://api.github.com/users/danielrozenberg/starred{/owner}{/repo}',
        'subscriptions_url':
          'https://api.github.com/users/danielrozenberg/subscriptions',
        'organizations_url':
          'https://api.github.com/users/danielrozenberg/orgs',
        'repos_url': 'https://api.github.com/users/danielrozenberg/repos',
        'events_url':
          'https://api.github.com/users/danielrozenberg/events{/privacy}',
        'received_events_url':
          'https://api.github.com/users/danielrozenberg/received_events',
        'type': 'User',
        'site_admin': false,
      },
      'repo': {
        'id': 103311490,
        'node_id': 'MDEwOlJlcG9zaXRvcnkxMDMzMTE0OTA=',
        'name': 'amphtml',
        'full_name': 'danielrozenberg/amphtml',
        'private': false,
        'owner': {
          'login': 'danielrozenberg',
          'id': 1839738,
          'node_id': 'MDQ6VXNlcjE4Mzk3Mzg=',
          'avatar_url': 'https://avatars.githubusercontent.com/u/1839738?v=4',
          'gravatar_id': '',
          'url': 'https://api.github.com/users/danielrozenberg',
          'html_url': 'https://github.com/danielrozenberg',
          'followers_url':
            'https://api.github.com/users/danielrozenberg/followers',
          'following_url':
            'https://api.github.com/users/danielrozenberg/following{/other_user}',
          'gists_url':
            'https://api.github.com/users/danielrozenberg/gists{/gist_id}',
          'starred_url':
            'https://api.github.com/users/danielrozenberg/starred{/owner}{/repo}',
          'subscriptions_url':
            'https://api.github.com/users/danielrozenberg/subscriptions',
          'organizations_url':
            'https://api.github.com/users/danielrozenberg/orgs',
          'repos_url': 'https://api.github.com/users/danielrozenberg/repos',
          'events_url':
            'https://api.github.com/users/danielrozenberg/events{/privacy}',
          'received_events_url':
            'https://api.github.com/users/danielrozenberg/received_events',
          'type': 'User',
          'site_admin': false,
        },
        'html_url': 'https://github.com/danielrozenberg/amphtml',
        'description':
          'AMP HTML source code, samples, and documentation.  See below for more info.',
        'fork': true,
        'url': 'https://api.github.com/repos/danielrozenberg/amphtml',
        'forks_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/forks',
        'keys_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/keys{/key_id}',
        'collaborators_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/collaborators{/collaborator}',
        'teams_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/teams',
        'hooks_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/hooks',
        'issue_events_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/issues/events{/number}',
        'events_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/events',
        'assignees_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/assignees{/user}',
        'branches_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/branches{/branch}',
        'tags_url': 'https://api.github.com/repos/danielrozenberg/amphtml/tags',
        'blobs_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/blobs{/sha}',
        'git_tags_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/tags{/sha}',
        'git_refs_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/refs{/sha}',
        'trees_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/trees{/sha}',
        'statuses_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/statuses/{sha}',
        'languages_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/languages',
        'stargazers_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/stargazers',
        'contributors_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/contributors',
        'subscribers_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/subscribers',
        'subscription_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/subscription',
        'commits_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/commits{/sha}',
        'git_commits_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/commits{/sha}',
        'comments_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/comments{/number}',
        'issue_comment_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/issues/comments{/number}',
        'contents_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/contents/{+path}',
        'compare_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/compare/{base}...{head}',
        'merges_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/merges',
        'archive_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/{archive_format}{/ref}',
        'downloads_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/downloads',
        'issues_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/issues{/number}',
        'pulls_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/pulls{/number}',
        'milestones_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/milestones{/number}',
        'notifications_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/notifications{?since,all,participating}',
        'labels_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/labels{/name}',
        'releases_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/releases{/id}',
        'deployments_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/deployments',
        'created_at': '2017-09-12T19:22:30Z',
        'updated_at': '2021-10-04T21:19:04Z',
        'pushed_at': '2021-10-04T21:32:48Z',
        'git_url': 'git://github.com/danielrozenberg/amphtml.git',
        'ssh_url': 'git@github.com:danielrozenberg/amphtml.git',
        'clone_url': 'https://github.com/danielrozenberg/amphtml.git',
        'svn_url': 'https://github.com/danielrozenberg/amphtml',
        'homepage': 'https://www.ampproject.org',
        'size': 914185,
        'stargazers_count': 0,
        'watchers_count': 0,
        'language': 'JavaScript',
        'has_issues': false,
        'has_projects': true,
        'has_downloads': false,
        'has_wiki': false,
        'has_pages': false,
        'forks_count': 0,
        'mirror_url': null,
        'archived': false,
        'disabled': false,
        'open_issues_count': 1,
        'license': {
          'key': 'apache-2.0',
          'name': 'Apache License 2.0',
          'spdx_id': 'Apache-2.0',
          'url': 'https://api.github.com/licenses/apache-2.0',
          'node_id': 'MDc6TGljZW5zZTI=',
        },
        'allow_forking': true,
        'visibility': 'public',
        'forks': 0,
        'open_issues': 1,
        'watchers': 0,
        'default_branch': 'main',
        'allow_squash_merge': true,
        'allow_merge_commit': false,
        'allow_rebase_merge': false,
        'allow_auto_merge': false,
        'delete_branch_on_merge': false,
      },
    },
    'base': {
      'label': 'danielrozenberg:main',
      'ref': 'main',
      'sha': 'e74a77b06b9ae3c7cd129a2eb14e023a537b1888',
      'user': {
        'login': 'danielrozenberg',
        'id': 1839738,
        'node_id': 'MDQ6VXNlcjE4Mzk3Mzg=',
        'avatar_url': 'https://avatars.githubusercontent.com/u/1839738?v=4',
        'gravatar_id': '',
        'url': 'https://api.github.com/users/danielrozenberg',
        'html_url': 'https://github.com/danielrozenberg',
        'followers_url':
          'https://api.github.com/users/danielrozenberg/followers',
        'following_url':
          'https://api.github.com/users/danielrozenberg/following{/other_user}',
        'gists_url':
          'https://api.github.com/users/danielrozenberg/gists{/gist_id}',
        'starred_url':
          'https://api.github.com/users/danielrozenberg/starred{/owner}{/repo}',
        'subscriptions_url':
          'https://api.github.com/users/danielrozenberg/subscriptions',
        'organizations_url':
          'https://api.github.com/users/danielrozenberg/orgs',
        'repos_url': 'https://api.github.com/users/danielrozenberg/repos',
        'events_url':
          'https://api.github.com/users/danielrozenberg/events{/privacy}',
        'received_events_url':
          'https://api.github.com/users/danielrozenberg/received_events',
        'type': 'User',
        'site_admin': false,
      },
      'repo': {
        'id': 103311490,
        'node_id': 'MDEwOlJlcG9zaXRvcnkxMDMzMTE0OTA=',
        'name': 'amphtml',
        'full_name': 'danielrozenberg/amphtml',
        'private': false,
        'owner': {
          'login': 'danielrozenberg',
          'id': 1839738,
          'node_id': 'MDQ6VXNlcjE4Mzk3Mzg=',
          'avatar_url': 'https://avatars.githubusercontent.com/u/1839738?v=4',
          'gravatar_id': '',
          'url': 'https://api.github.com/users/danielrozenberg',
          'html_url': 'https://github.com/danielrozenberg',
          'followers_url':
            'https://api.github.com/users/danielrozenberg/followers',
          'following_url':
            'https://api.github.com/users/danielrozenberg/following{/other_user}',
          'gists_url':
            'https://api.github.com/users/danielrozenberg/gists{/gist_id}',
          'starred_url':
            'https://api.github.com/users/danielrozenberg/starred{/owner}{/repo}',
          'subscriptions_url':
            'https://api.github.com/users/danielrozenberg/subscriptions',
          'organizations_url':
            'https://api.github.com/users/danielrozenberg/orgs',
          'repos_url': 'https://api.github.com/users/danielrozenberg/repos',
          'events_url':
            'https://api.github.com/users/danielrozenberg/events{/privacy}',
          'received_events_url':
            'https://api.github.com/users/danielrozenberg/received_events',
          'type': 'User',
          'site_admin': false,
        },
        'html_url': 'https://github.com/danielrozenberg/amphtml',
        'description':
          'AMP HTML source code, samples, and documentation.  See below for more info.',
        'fork': true,
        'url': 'https://api.github.com/repos/danielrozenberg/amphtml',
        'forks_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/forks',
        'keys_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/keys{/key_id}',
        'collaborators_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/collaborators{/collaborator}',
        'teams_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/teams',
        'hooks_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/hooks',
        'issue_events_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/issues/events{/number}',
        'events_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/events',
        'assignees_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/assignees{/user}',
        'branches_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/branches{/branch}',
        'tags_url': 'https://api.github.com/repos/danielrozenberg/amphtml/tags',
        'blobs_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/blobs{/sha}',
        'git_tags_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/tags{/sha}',
        'git_refs_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/refs{/sha}',
        'trees_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/trees{/sha}',
        'statuses_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/statuses/{sha}',
        'languages_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/languages',
        'stargazers_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/stargazers',
        'contributors_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/contributors',
        'subscribers_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/subscribers',
        'subscription_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/subscription',
        'commits_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/commits{/sha}',
        'git_commits_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/git/commits{/sha}',
        'comments_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/comments{/number}',
        'issue_comment_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/issues/comments{/number}',
        'contents_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/contents/{+path}',
        'compare_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/compare/{base}...{head}',
        'merges_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/merges',
        'archive_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/{archive_format}{/ref}',
        'downloads_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/downloads',
        'issues_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/issues{/number}',
        'pulls_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/pulls{/number}',
        'milestones_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/milestones{/number}',
        'notifications_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/notifications{?since,all,participating}',
        'labels_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/labels{/name}',
        'releases_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/releases{/id}',
        'deployments_url':
          'https://api.github.com/repos/danielrozenberg/amphtml/deployments',
        'created_at': '2017-09-12T19:22:30Z',
        'updated_at': '2021-10-04T21:19:04Z',
        'pushed_at': '2021-10-04T21:32:48Z',
        'git_url': 'git://github.com/danielrozenberg/amphtml.git',
        'ssh_url': 'git@github.com:danielrozenberg/amphtml.git',
        'clone_url': 'https://github.com/danielrozenberg/amphtml.git',
        'svn_url': 'https://github.com/danielrozenberg/amphtml',
        'homepage': 'https://www.ampproject.org',
        'size': 914185,
        'stargazers_count': 0,
        'watchers_count': 0,
        'language': 'JavaScript',
        'has_issues': false,
        'has_projects': true,
        'has_downloads': false,
        'has_wiki': false,
        'has_pages': false,
        'forks_count': 0,
        'mirror_url': null,
        'archived': false,
        'disabled': false,
        'open_issues_count': 1,
        'license': {
          'key': 'apache-2.0',
          'name': 'Apache License 2.0',
          'spdx_id': 'Apache-2.0',
          'url': 'https://api.github.com/licenses/apache-2.0',
          'node_id': 'MDc6TGljZW5zZTI=',
        },
        'allow_forking': true,
        'visibility': 'public',
        'forks': 0,
        'open_issues': 1,
        'watchers': 0,
        'default_branch': 'main',
        'allow_squash_merge': true,
        'allow_merge_commit': false,
        'allow_rebase_merge': false,
        'allow_auto_merge': false,
        'delete_branch_on_merge': false,
      },
    },
    '_links': {
      'self': {
        'href': 'https://api.github.com/repos/danielrozenberg/amphtml/pulls/12',
      },
      'html': {
        'href': 'https://github.com/danielrozenberg/amphtml/pull/12',
      },
      'issue': {
        'href':
          'https://api.github.com/repos/danielrozenberg/amphtml/issues/12',
      },
      'comments': {
        'href':
          'https://api.github.com/repos/danielrozenberg/amphtml/issues/12/comments',
      },
      'review_comments': {
        'href':
          'https://api.github.com/repos/danielrozenberg/amphtml/pulls/12/comments',
      },
      'review_comment': {
        'href':
          'https://api.github.com/repos/danielrozenberg/amphtml/pulls/comments{/number}',
      },
      'commits': {
        'href':
          'https://api.github.com/repos/danielrozenberg/amphtml/pulls/12/commits',
      },
      'statuses': {
        'href':
          'https://api.github.com/repos/danielrozenberg/amphtml/statuses/3f1af58d70044a996606907d9a221b885d8954a1',
      },
    },
    'author_association': 'OWNER',
    'auto_merge': null,
    'active_lock_reason': null,
    'merged': true,
    'mergeable': null,
    'rebaseable': null,
    'mergeable_state': 'unknown',
    'merged_by': {
      'login': 'danielrozenberg',
      'id': 1839738,
      'node_id': 'MDQ6VXNlcjE4Mzk3Mzg=',
      'avatar_url': 'https://avatars.githubusercontent.com/u/1839738?v=4',
      'gravatar_id': '',
      'url': 'https://api.github.com/users/danielrozenberg',
      'html_url': 'https://github.com/danielrozenberg',
      'followers_url': 'https://api.github.com/users/danielrozenberg/followers',
      'following_url':
        'https://api.github.com/users/danielrozenberg/following{/other_user}',
      'gists_url':
        'https://api.github.com/users/danielrozenberg/gists{/gist_id}',
      'starred_url':
        'https://api.github.com/users/danielrozenberg/starred{/owner}{/repo}',
      'subscriptions_url':
        'https://api.github.com/users/danielrozenberg/subscriptions',
      'organizations_url': 'https://api.github.com/users/danielrozenberg/orgs',
      'repos_url': 'https://api.github.com/users/danielrozenberg/repos',
      'events_url':
        'https://api.github.com/users/danielrozenberg/events{/privacy}',
      'received_events_url':
        'https://api.github.com/users/danielrozenberg/received_events',
      'type': 'User',
      'site_admin': false,
    },
    'comments': 0,
    'review_comments': 0,
    'maintainer_can_modify': false,
    'commits': 1,
    'additions': 1,
    'deletions': 1,
    'changed_files': 1,
  },
  'repository': {
    'id': 103311490,
    'node_id': 'MDEwOlJlcG9zaXRvcnkxMDMzMTE0OTA=',
    'name': 'amphtml',
    'full_name': 'danielrozenberg/amphtml',
    'private': false,
    'owner': {
      'login': 'danielrozenberg',
      'id': 1839738,
      'node_id': 'MDQ6VXNlcjE4Mzk3Mzg=',
      'avatar_url': 'https://avatars.githubusercontent.com/u/1839738?v=4',
      'gravatar_id': '',
      'url': 'https://api.github.com/users/danielrozenberg',
      'html_url': 'https://github.com/danielrozenberg',
      'followers_url': 'https://api.github.com/users/danielrozenberg/followers',
      'following_url':
        'https://api.github.com/users/danielrozenberg/following{/other_user}',
      'gists_url':
        'https://api.github.com/users/danielrozenberg/gists{/gist_id}',
      'starred_url':
        'https://api.github.com/users/danielrozenberg/starred{/owner}{/repo}',
      'subscriptions_url':
        'https://api.github.com/users/danielrozenberg/subscriptions',
      'organizations_url': 'https://api.github.com/users/danielrozenberg/orgs',
      'repos_url': 'https://api.github.com/users/danielrozenberg/repos',
      'events_url':
        'https://api.github.com/users/danielrozenberg/events{/privacy}',
      'received_events_url':
        'https://api.github.com/users/danielrozenberg/received_events',
      'type': 'User',
      'site_admin': false,
    },
    'html_url': 'https://github.com/danielrozenberg/amphtml',
    'description':
      'AMP HTML source code, samples, and documentation.  See below for more info.',
    'fork': true,
    'url': 'https://api.github.com/repos/danielrozenberg/amphtml',
    'forks_url': 'https://api.github.com/repos/danielrozenberg/amphtml/forks',
    'keys_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/keys{/key_id}',
    'collaborators_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/collaborators{/collaborator}',
    'teams_url': 'https://api.github.com/repos/danielrozenberg/amphtml/teams',
    'hooks_url': 'https://api.github.com/repos/danielrozenberg/amphtml/hooks',
    'issue_events_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/issues/events{/number}',
    'events_url': 'https://api.github.com/repos/danielrozenberg/amphtml/events',
    'assignees_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/assignees{/user}',
    'branches_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/branches{/branch}',
    'tags_url': 'https://api.github.com/repos/danielrozenberg/amphtml/tags',
    'blobs_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/git/blobs{/sha}',
    'git_tags_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/git/tags{/sha}',
    'git_refs_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/git/refs{/sha}',
    'trees_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/git/trees{/sha}',
    'statuses_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/statuses/{sha}',
    'languages_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/languages',
    'stargazers_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/stargazers',
    'contributors_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/contributors',
    'subscribers_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/subscribers',
    'subscription_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/subscription',
    'commits_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/commits{/sha}',
    'git_commits_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/git/commits{/sha}',
    'comments_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/comments{/number}',
    'issue_comment_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/issues/comments{/number}',
    'contents_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/contents/{+path}',
    'compare_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/compare/{base}...{head}',
    'merges_url': 'https://api.github.com/repos/danielrozenberg/amphtml/merges',
    'archive_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/{archive_format}{/ref}',
    'downloads_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/downloads',
    'issues_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/issues{/number}',
    'pulls_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/pulls{/number}',
    'milestones_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/milestones{/number}',
    'notifications_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/notifications{?since,all,participating}',
    'labels_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/labels{/name}',
    'releases_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/releases{/id}',
    'deployments_url':
      'https://api.github.com/repos/danielrozenberg/amphtml/deployments',
    'created_at': '2017-09-12T19:22:30Z',
    'updated_at': '2021-10-04T21:19:04Z',
    'pushed_at': '2021-10-04T21:32:48Z',
    'git_url': 'git://github.com/danielrozenberg/amphtml.git',
    'ssh_url': 'git@github.com:danielrozenberg/amphtml.git',
    'clone_url': 'https://github.com/danielrozenberg/amphtml.git',
    'svn_url': 'https://github.com/danielrozenberg/amphtml',
    'homepage': 'https://www.ampproject.org',
    'size': 914185,
    'stargazers_count': 0,
    'watchers_count': 0,
    'language': 'JavaScript',
    'has_issues': false,
    'has_projects': true,
    'has_downloads': false,
    'has_wiki': false,
    'has_pages': false,
    'forks_count': 0,
    'mirror_url': null,
    'archived': false,
    'disabled': false,
    'open_issues_count': 1,
    'license': {
      'key': 'apache-2.0',
      'name': 'Apache License 2.0',
      'spdx_id': 'Apache-2.0',
      'url': 'https://api.github.com/licenses/apache-2.0',
      'node_id': 'MDc6TGljZW5zZTI=',
    },
    'allow_forking': true,
    'visibility': 'public',
    'forks': 0,
    'open_issues': 1,
    'watchers': 0,
    'default_branch': 'main',
  },
  'sender': {
    'login': 'danielrozenberg',
    'id': 1839738,
    'node_id': 'MDQ6VXNlcjE4Mzk3Mzg=',
    'avatar_url': 'https://avatars.githubusercontent.com/u/1839738?v=4',
    'gravatar_id': '',
    'url': 'https://api.github.com/users/danielrozenberg',
    'html_url': 'https://github.com/danielrozenberg',
    'followers_url': 'https://api.github.com/users/danielrozenberg/followers',
    'following_url':
      'https://api.github.com/users/danielrozenberg/following{/other_user}',
    'gists_url': 'https://api.github.com/users/danielrozenberg/gists{/gist_id}',
    'starred_url':
      'https://api.github.com/users/danielrozenberg/starred{/owner}{/repo}',
    'subscriptions_url':
      'https://api.github.com/users/danielrozenberg/subscriptions',
    'organizations_url': 'https://api.github.com/users/danielrozenberg/orgs',
    'repos_url': 'https://api.github.com/users/danielrozenberg/repos',
    'events_url':
      'https://api.github.com/users/danielrozenberg/events{/privacy}',
    'received_events_url':
      'https://api.github.com/users/danielrozenberg/received_events',
    'type': 'User',
    'site_admin': false,
  },
  'installation': {
    'id': 19904307,
    'node_id': 'MDIzOkludGVncmF0aW9uSW5zdGFsbGF0aW9uMTk5MDQzMDc=',
  },
} as PullRequestClosedEvent;
