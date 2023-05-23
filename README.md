# Release

This action can be used to release a new version in a GitHub repository.

It will fail if a release exist for the specified tag or if the tag is
invalid. A valid tag must start with v followed by a semantic version.
For example v1.0.0.

In order to generate release notes, this action will try to get the
latest release. If found, the release notes will be generated based on
the changes since latest release. After creating the release, a major
release tag will be created or updated to point to the new release.

For example, if the specified tag is v1.0.0, this action will create a
release with the name 'Release v1.0.0' and two tags that point to it,
'v1.0.0' and 'v1'.

## Usage

<!-- start usage -->
```yaml
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
    - name: Release
      uses: innofactororg/gha-release@v1
      with:
        # The GitHub token for creating the release.
        #
        # Default: secrets.GITHUB_TOKEN
        github-token: ${{ secrets.GITHUB_TOKEN }}

        # Create a draft (unpublished) release.
        #
        # Default false
        draft: false

        # Identify the release as a prerelease.
        #
        # Default false
        prerelease: false

        # The tag to release.
        #
        # Required
        tag: v1.0.0
```
