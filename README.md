# xiafanzeng.github.io

Source for Fanzeng Xia's personal website at [xiafanzeng.me](https://xiafanzeng.me/), published with Hugo and GitHub Pages.

The canonical domain is configured in `config/_default/config.yaml`; GitHub Actions uses that configuration directly. The Chinese homepage remains at `/` and the English homepage at `/en/`, with all existing content paths preserved.

Set `xiafanzeng.me` as the custom domain in the repository's GitHub Pages settings. This custom Actions publishing workflow [does not require a CNAME file](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). After the hosting change, verify that the legacy homepage, `/en/`, and existing content URLs redirect to the same paths on the new domain.

See [visitor statistics](docs/visitor-statistics.md) for the shared new/legacy-domain analytics setup.
