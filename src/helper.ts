import {info} from '@actions/core'
import {Octokit} from '@octokit/rest'

import {isErrorWithStatus, processError} from './error-tools'

export class Helper {
  constructor(private octokit: Octokit) {}

  async releaseExist(
    owner: string,
    repo: string,
    tag: string
  ): Promise<boolean> {
    try {
      info(`Get release ${tag}:`)
      const response = await this.octokit.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag
      })
      info(`Found ${response.data.html_url}`)
      return true
    } catch (error: unknown) {
      if (isErrorWithStatus(error) && error.status === 404) {
        info(`Release ${tag} don't exist.`)
      } else {
        throw new Error(processError(error, false))
      }
    }
    return false
  }

  async getLatestRelease(
    owner: string,
    repo: string
  ): Promise<string | undefined> {
    try {
      info('Get latest release:')
      const response = await this.octokit.rest.repos.getLatestRelease({
        owner,
        repo
      })
      const result = response.data.tag_name
      info(`Found ${response.data.html_url}`)
      return result
    } catch (error: unknown) {
      if (isErrorWithStatus(error) && error.status === 404) {
        info(`The repository ${repo} in ${owner} has no releases.`)
      } else {
        throw new Error(processError(error, false))
      }
    }
  }

  async createRelease(
    draft: boolean,
    owner: string,
    prerelease: boolean,
    repo: string,
    target_commitish: string,
    tag_name: string,
    previous_tag_name?: string
  ): Promise<void> {
    info(`Create release ${tag_name} for ${owner} in ${repo}:`)
    const response = await this.octokit.rest.repos.createRelease({
      draft,
      generate_release_notes: true,
      make_latest: 'true',
      name: `${tag_name.replace(/^v/, '')}`,
      prerelease,
      previous_tag_name,
      owner,
      repo,
      tag_name,
      target_commitish
    })
    info(`Created ${response.data.html_url}`)
  }

  async setMajorRelease(
    owner: string,
    repo: string,
    sha: string,
    tag: string
  ): Promise<void> {
    const majorTag = tag.substring(0, tag.indexOf('.'))
    const ref = `tags/${majorTag}`
    let tagExist = false
    try {
      info(`Get tag ${majorTag}:`)
      const response = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref
      })
      info(`Found ${response.data.url}`)
      tagExist = true
    } catch (error: unknown) {
      if (isErrorWithStatus(error) && error.status === 404) {
        info(`The tag ${majorTag} don't exist`)
      } else {
        throw new Error(processError(error, false))
      }
    }
    if (tagExist) {
      info(`Update tag ${majorTag}:`)
      const response = await this.octokit.rest.git.updateRef({
        force: true,
        owner,
        repo,
        ref,
        sha
      })
      info(`Updated ${response.data.url}`)
    } else {
      info(`Create tag ${majorTag}:`)
      const response = await this.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/${ref}`,
        sha
      })
      info(`Created ${response.data.url}`)
    }
  }
}
