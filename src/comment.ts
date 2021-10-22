import * as core from "@actions/core";
import * as github from "@actions/github";

export async function run() {
  const token = core.getInput("token", { required: true });
  const commentText = core.getInput("comment", { required: true })
  const update = !!core.getInput("update", { required: false })

  const repo = getRepo()
  if (!repo) {
    console.log("Could not get repo from context, exiting");
    return;
  }

  const prNumber = getPrNumber()
  if (!prNumber) {
    console.log("Could not get pull request number from context, exiting");
    return;
  }

  // Get octokit
  const octokit = github.getOctokit(token)

  // Get all previous comments
  const { data: comments } = await octokit.rest.issues.listComments({
    ...repo,
    issue_number: prNumber,
  })

    // Check if there is already a comment by us
    const comment = comments.find(
      (comment) =>
        comment.user != null &&
        comment.body != null &&
        comment.user.login === "github-actions[bot]" &&
        comment.body.startsWith("PR-COMMENTER:")
    )
  
    if (comment && update) {
      await octokit.rest.issues.updateComment({
        ...repo,
        comment_id: comment.id,
        body: commentText,
      })
    } else {
      await octokit.rest.issues.createComment({
        ...repo,
        issue_number: prNumber,
        body: commentText,
      })
    }
  
}

function getRepo() {
  const repo = github.context.repo
  if (!repo) {
    return undefined
  }

  return repo
}

function getPrNumber(): number | undefined {
  const pullRequest = github.context.payload.pull_request
  if (!pullRequest) {
    return undefined
  }

  return pullRequest.number
}