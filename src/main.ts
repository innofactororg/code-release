import {getInput, setFailed} from '@actions/core'
import ensureError from 'ensure-error'

import {newRelease} from './release'

async function run(): Promise<void> {
  try {
    const tagMatch =
      /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm
    const draft = JSON.parse(
      getInput('draft', {required: true}).toLowerCase()
    ) as boolean
    const prerelease = JSON.parse(
      getInput('prerelease', {required: true}).toLowerCase()
    ) as boolean
    const tag = getInput('tag', {required: true})
    const token = getInput('github-token', {required: true})

    if (tag.match(tagMatch) === null) {
      setFailed(
        `The specified tag ${tag} is not valid. It must start with v followed by a semantic version. For example v1.0.0.`
      )
      return
    }
    await newRelease({
      draft,
      prerelease,
      token,
      tag
    })
  } catch (_error: unknown) {
    const error = ensureError(_error)
    setFailed(error)
  }
}
void run()
