import { s__ } from '~/locale';

export const ACTION_LABELS = {
  gitWrite: {
    title: s__('LearnGitRepo|Create or import a repository'),
    actionLabel: s__('LearnGitRepo|Create or import a repository'),
    description: s__('LearnGitRepo|Create or import your first repository into your new project.'),
    section: 'workspace',
    position: 1,
  },
  userAdded: {
    title: s__('LearnGitRepo|Invite your colleagues'),
    actionLabel: s__('LearnGitRepo|Invite your colleagues'),
    description: s__(
      'LearnGitRepo|GitRepo works best as a team. Invite your colleague to enjoy all features.',
    ),
    section: 'workspace',
    position: 0,
  },
  pipelineCreated: {
    title: s__('LearnGitRepo|Set up CI/CD'),
    actionLabel: s__('LearnGitRepo|Set-up CI/CD'),
    description: s__('LearnGitRepo|Save time by automating your integration and deployment tasks.'),
    section: 'workspace',
    position: 2,
  },
  trialStarted: {
    title: s__('LearnGitRepo|Start a free Ultimate trial'),
    actionLabel: s__('LearnGitRepo|Try GitRepo Ultimate for free'),
    description: s__('LearnGitRepo|Try all GitRepo features for 30 days, no credit card required.'),
    section: 'workspace',
    position: 3,
    openInNewTab: true,
  },
  codeOwnersEnabled: {
    title: s__('LearnGitRepo|Add code owners'),
    actionLabel: s__('LearnGitRepo|Add code owners'),
    description: s__(
      'LearnGitRepo|Prevent unexpected changes to important assets by assigning ownership of files and paths.',
    ),
    trialRequired: true,
    section: 'workspace',
    position: 4,
    openInNewTab: true,
    videoTutorial: 'https://vimeo.com/670896787',
  },
  requiredMrApprovalsEnabled: {
    title: s__('LearnGitRepo|Add merge request approval'),
    actionLabel: s__('LearnGitRepo|Enable require merge approvals'),
    description: s__('LearnGitRepo|Route code reviews to the right reviewers, every time.'),
    trialRequired: true,
    section: 'workspace',
    position: 5,
    openInNewTab: true,
    videoTutorial: 'https://vimeo.com/670904904',
  },
  mergeRequestCreated: {
    title: s__('LearnGitRepo|Submit a merge request'),
    actionLabel: s__('LearnGitRepo|Submit a merge request (MR)'),
    description: s__('LearnGitRepo|Review and edit proposed changes to source code.'),
    section: 'plan',
    position: 1,
  },
  securityScanEnabled: {
    title: s__('LearnGitRepo|Run a Security scan using CI/CD'),
    actionLabel: s__('LearnGitRepo|Run a Security scan using CI/CD'),
    description: s__('LearnGitRepo|Scan your code to uncover vulnerabilities before deploying.'),
    section: 'deploy',
    position: 1,
  },
  issueCreated: {
    title: s__('LearnGitRepo|Create an issue'),
    actionLabel: s__('LearnGitRepo|Create an issue'),
    description: s__(
      'LearnGitRepo|Create/import issues (tickets) to collaborate on ideas and plan work.',
    ),
    section: 'plan',
    position: 0,
  },
};

export const ACTION_SECTIONS = {
  workspace: {
    title: s__('LearnGitRepo|Set up your workspace'),
    description: s__(
      "LearnGitRepo|Complete these tasks first so you can enjoy GitRepo's features to their fullest:",
    ),
  },
  plan: {
    title: s__('LearnGitRepo|Plan and execute'),
    description: s__(
      'LearnGitRepo|Create a workflow for your new workspace, and learn how GitRepo features work together:',
    ),
  },
  deploy: {
    title: s__('LearnGitRepo|Deploy'),
    description: s__(
      'LearnGitRepo|Use your new GitRepo workflow to deploy your application, monitor its health, and keep it secure:',
    ),
  },
};

export const INVITE_MODAL_OPEN_COOKIE = 'confetti_post_signup';
