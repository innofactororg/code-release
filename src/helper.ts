import {info} from '@actions/core'
import {getOctokit} from '@actions/github'

export async function releaseExist(
  owner: string,
  repo: string,
  tag: string,
  token: string
): Promise<boolean> {
  const octokit = getOctokit(token)
  try {
    info(`Get release ${tag}:`)
    const response = await octokit.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag
    })
    info(`Found ${response.data.html_url}`)
    return true
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Not Found')) {
      info(`Release ${tag} don't exist.`)
    } else if (error instanceof Error) {
      throw new Error(
        `Failed to get release ${tag}. ${error.message} (${error.name}).`
      )
    } else {
      throw new Error(`Failed to get release ${tag}: ${JSON.stringify(error)}`)
    }
  }
  return false
}

export async function getLatestRelease(
  owner: string,
  repo: string,
  token: string
): Promise<string | undefined> {
  const octokit = getOctokit(token)
  try {
    info('Get latest release:')
    const response = await octokit.rest.repos.getLatestRelease({owner, repo})
    const result = response.data.tag_name
    info(`Found ${response.data.html_url}`)
    return result
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Not Found')) {
      info(`The repository ${repo} in ${owner} has no releases.`)
    } else if (error instanceof Error) {
      throw new Error(
        `Failed to get release. ${error.message} (${error.name}).`
      )
    } else {
      throw new Error(`Failed to get release: ${JSON.stringify(error)}`)
    }
  }
}

export async function createRelease(
  draft: boolean,
  owner: string,
  prerelease: boolean,
  repo: string,
  target_commitish: string,
  tag_name: string,
  token: string,
  previous_tag_name?: string
): Promise<void> {
  const octokit = getOctokit(token)
  try {
    info(`Create release ${tag_name} for ${owner} in ${repo}:`)
    const response = await octokit.rest.repos.createRelease({
      draft,
      generate_release_notes: true,
      make_latest: 'true',
      name: `Release ${tag_name.replace(/^v/, '')}`,
      prerelease,
      previous_tag_name,
      owner,
      repo,
      tag_name,
      target_commitish
    })
    info(`Created ${response.data.html_url}`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to create release ${tag_name}. ${error.message} (${error.name}).`
      )
    } else {
      throw new Error(
        `Failed to create release ${tag_name}: ${JSON.stringify(error)}`
      )
    }
  }
}

export async function setMajorRelease(
  owner: string,
  repo: string,
  sha: string,
  tag: string,
  token: string
): Promise<void> {
  const octokit = getOctokit(token)
  const majorTag = tag.substring(0, tag.indexOf('.'))
  const ref = `tags/${majorTag}`
  let tagExist = false
  let action = 'create'
  try {
    info(`Get tag ${majorTag}:`)
    const response = await octokit.rest.git.getRef({
      owner,
      repo,
      ref
    })
    info(`Found ${response.data.url}`)
    tagExist = true
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Not Found')) {
      info(`The tag ${majorTag} don't exist`)
    } else if (error instanceof Error) {
      throw new Error(
        `Failed to get tag ${majorTag}. ${error.message} (${error.name}).`
      )
    } else {
      throw new Error(`Failed to get tag ${majorTag}: ${JSON.stringify(error)}`)
    }
  }
  try {
    if (tagExist) {
      info(`Update tag ${majorTag}:`)
      action = 'update'
      const response = await octokit.rest.git.updateRef({
        force: true,
        owner,
        repo,
        ref,
        sha
      })
      info(`Updated ${response.data.url}`)
    } else {
      info(`Create tag ${majorTag}:`)
      const response = await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/${ref}`,
        sha
      })
      info(`Created ${response.data.url}`)
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to ${action} tag ${majorTag}. ${error.message} (${error.name}).`
      )
    } else {
      throw new Error(
        `Failed to ${action} tag ${majorTag}: ${JSON.stringify(error)}`
      )
    }
  }
}
