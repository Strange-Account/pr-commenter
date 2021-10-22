import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  if (github.context.eventName !== "pull_request") {
    core.setFailed("Can only run on pull requests!");
    return;
  }

  const githubToken = core.getInput("token");
  const commentText = core.getInput("comment");
  const update = core.getInput("update");

  const context = github.context;
  const repo = context.repo;
  const pullRequestNumber = context.payload.pull_request?.number;

  if (!pullRequestNumber) {
    core.setFailed("Cannot get pull request number!");
    return;
  }

  // Get octokit
  const octokit = github.getOctokit(githubToken);

  // Get all previous comments
  const { data: comments } = await octokit.rest.issues.listComments({
    ...repo,
    issue_number: pullRequestNumber,
  });

  // Check if there is already a comment by us
  const comment = comments.find(
    (comment) =>
      comment.user != null &&
      comment.body != null &&
      comment.user.login === "github-actions[bot]" &&
      comment.body.startsWith("PR-COMMENTER:")
  );

  if (comment && update === "true") {
    await octokit.rest.issues.updateComment({
      ...repo,
      comment_id: comment.id,
      body: commentText,
    });
  } else {
    await octokit.rest.issues.createComment({
      ...repo,
      issue_number: pullRequestNumber,
      body: commentText,
    });
  }
}

// Main method
run().catch((error) => core.setFailed("Workflow failed!" + error.message));
