# Microsoft Store updates

Store product: [Morganized (9P90C0SFQ4BZ)](https://apps.microsoft.com/detail/9P90C0SFQ4BZ).

The Windows MSIX workflow builds on pushes to main. Publishing a stable GitHub
release automatically builds the tagged source and submits its MSIX to Microsoft
Store. Prereleases do not submit. Store certification still controls availability;
Store installations receive updates through Microsoft Store.

## One-time credentials

Follow [Microsoft's GitHub Actions setup](https://learn.microsoft.com/en-us/windows/apps/publish/msstore-dev-cli/github-actions):

1. Associate a Microsoft Entra tenant with the Partner Center developer account.
2. Register a dedicated Entra application for Morganized GitHub publishing.
3. Add that application under Partner Center User management, Microsoft Entra
   applications, with the Manager role required by the submission API.
4. Generate a client secret and add these repository Actions secrets:
   `AZURE_AD_TENANT_ID`, `AZURE_AD_APPLICATION_CLIENT_ID`,
   `AZURE_AD_APPLICATION_SECRET`, and `SELLER_ID`.

Enter secret values directly into GitHub, never in source files or issues. Record
the credential's expiry in your calendar and rotate it before expiration.

## Release an update

1. Set the same new stable version in `src-tauri/tauri.conf.json` and
   `src-tauri/Cargo.toml`; update and commit `Cargo.lock` using Cargo.
2. Merge the release source into main and check that the build succeeds. Download
   the unsigned MSIX artifact for inspection; Microsoft signs Store submissions.
3. Create tag `vMAJOR.MINOR.PATCH` on that source and publish its GitHub release.
   For example, app version `1.0.1` uses tag `v1.0.1` and MSIX version `1.0.1.0`.
4. Check the Actions submission job and Partner Center certification status.

The version must exceed the last accepted Store version. Version 1.0.0 is already
live and is blocked from resubmission. Each MSIX component must fit 0–65535, the
major component must be positive, and the Store-reserved final component is zero.

For a build-only check, run the workflow manually with **publish** unchecked.
Checking **publish** explicitly submits the selected ref's version, including
when retrying a failed submission. Inspect Partner Center before retrying after
an uncertain result. Workflow runs are serialized to avoid overlapping updates.
