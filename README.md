# xiafanzeng.github.io

Source for Fanzeng Xia's personal website at [xiafanzeng.me](https://xiafanzeng.me/), built with Hugo and hosted in Hong Kong. GitHub Pages remains published for the legacy GitHub hostname.

The canonical domain is configured in `config/_default/config.yaml`; GitHub Actions uses that configuration directly. The Chinese homepage remains at `/` and the English homepage at `/en/`, with all existing content paths preserved.

Set `xiafanzeng.me` as the custom domain in the repository's GitHub Pages settings. This custom Actions publishing workflow [does not require a CNAME file](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). After the hosting change, verify that the legacy homepage, `/en/`, and existing content URLs redirect to the same paths on the new domain.

Each push to `main` builds the site once, then publishes the same artifact independently to GitHub Pages and the Hong Kong host. Configure repository Actions secrets `HOMEPAGE_DEPLOY_KEY` and `HOMEPAGE_KNOWN_HOSTS` for the restricted `fanzengpages@149.88.85.148` rsync account. The server must confine that account's rsync root to the homepage directory; deployment synchronizes `public/` to `./` and removes obsolete files. SSH accepts only the pinned host key supplied in `HOMEPAGE_KNOWN_HOSTS`.

See [visitor statistics](docs/visitor-statistics.md) for the shared new/legacy-domain analytics setup.
