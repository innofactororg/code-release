import {context} from '@actions/github'
import {
  releaseExist,
  getLatestRelease,
  createRelease,
  setMajorRelease
} from './helper'

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
  try {
    const exist = await releaseExist(owner, repo, tag, token)
    if (exist) {
      throw new Error(`Release ${tag} exist`)
    } else {
      const latestRelease = await getLatestRelease(owner, repo, token)
      await createRelease(
        draft,
        owner,
        prerelease,
        repo,
        sha,
        tag,
        token,
        latestRelease
      )
      await setMajorRelease(owner, repo, sha, tag, token)
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to create new release: ${error.message} (${error.name})`
      )
    } else {
      throw new Error(`Failed to create new release: ${JSON.stringify(error)}`)
    }
  }
}
