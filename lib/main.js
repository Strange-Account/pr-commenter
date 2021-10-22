"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (github.context.eventName !== "pull_request") {
            core.setFailed("Can only run on pull requests!");
            return;
        }
        const githubToken = core.getInput("token");
        const commentText = core.getInput("comment");
        const update = core.getInput("update");
        const context = github.context;
        const repo = context.repo;
        const pullRequestNumber = (_a = context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
        if (!pullRequestNumber) {
            core.setFailed("Cannot get pull request number!");
            return;
        }
        // Get octokit
        const octokit = github.getOctokit(githubToken);
        // Get all previous comments
        const { data: comments } = yield octokit.rest.issues.listComments(Object.assign(Object.assign({}, repo), { issue_number: pullRequestNumber }));
        // Check if there is already a comment by us
        const comment = comments.find((comment) => comment.user != null &&
            comment.body != null &&
            comment.user.login === "github-actions[bot]" &&
            comment.body.startsWith("PR-COMMENTER:"));
        if (comment && update === "true") {
            yield octokit.rest.issues.updateComment(Object.assign(Object.assign({}, repo), { comment_id: comment.id, body: commentText }));
        }
        else {
            yield octokit.rest.issues.createComment(Object.assign(Object.assign({}, repo), { issue_number: pullRequestNumber, body: commentText }));
        }
    });
}
// Main method
run().catch((error) => core.setFailed("Workflow failed!" + error.message));
