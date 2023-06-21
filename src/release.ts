import {context} from '@actions/github'
import {Octokit} from '@octokit/rest'

import {Helper} from './helper'

export const newRelease = async ({
  draft,
  prerelease,
  token,
  tag
}: Readonly<{
  draft: boolean
  prerelease: boolean
  token: string
  tag: string
}>): Promise<void> => {
  const {owner, repo} = context.repo
  const sha = context.sha
  const octokit = new Octokit({
    auth: `token ${token || process.env.GITHUB_TOKEN}`,
    baseUrl: 'https://api.github.com'
  })
  const HelperApi = new Helper(octokit)
  const exist = await HelperApi.releaseExist(owner, repo, tag)
  if (exist) {
    throw new Error(`Release ${tag} exist`)
  } else {
    const latestRelease = await HelperApi.getLatestRelease(owner, repo)
    await HelperApi.createRelease(
      draft,
      owner,
      prerelease,
      repo,
      sha,
      tag,
      latestRelease
    )
    await HelperApi.setMajorRelease(owner, repo, sha, tag)
  }
}
