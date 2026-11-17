# Microsoft Store updates

Store product: [Morganized (9P90C0SFQ4BZ)](https://apps.microsoft.com/detail/9P90C0SFQ4BZ).

GitHub builds the Windows MSIX; updates are uploaded through Partner Center
manually. This is the selected release process and needs no Azure/Entra credentials
in GitHub. The workflow has no Store submission job.

Builds run on pushes to main, stable GitHub release publication, or manual dispatch.
Prereleases are skipped. Each run uploads an unsigned MSIX as a GitHub Actions
artifact. Microsoft signs packages submitted to the Store; this artifact is for
Store upload, not direct installation by customers.

## Release an update

1. Set the same new stable version in `src-tauri/tauri.conf.json` and
   `src-tauri/Cargo.toml`; update and commit `Cargo.lock` using Cargo.
2. Merge the release source into main and check that the Windows MSIX build succeeds.
3. If publishing a GitHub release, create tag `vMAJOR.MINOR.PATCH` on that source.
   For example, app version `1.0.1` uses tag `v1.0.1` and MSIX version `1.0.1.0`.
4. Download the matching `morganized-msix-VERSION-x64` Actions artifact and extract
   `Morganized_VERSION.0_x64.msix`.
5. Open [Morganized in Partner Center](https://partner.microsoft.com/en-us/dashboard/products/9P90C0SFQ4BZ/overview)
   and select **Start update**. Upload the MSIX in Packages, review any required
   listing or release information, and submit the update for certification.
6. Check Partner Center for certification results and publication status.

The owner or an authorized assistant can perform the upload through the signed-in
Partner Center browser session. Microsoft account sign-in and verification steps
may require the owner. Existing Store installations receive the published update
through Microsoft Store.

The version must exceed the last accepted Store version; 1.0.0 is already live.
Building that version again is allowed for validation, but do not upload it as an
update. Each MSIX component must fit 0–65535, the
major component must be positive, and the Store-reserved final component is zero.

Every workflow run builds only. Uploading and submitting are separate actions in
Partner Center. Inspect the current submission before retrying after an uncertain
result to avoid creating duplicate updates.
