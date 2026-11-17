# Events source notes

The homepage currently contains eight cards covering nine displayed source links. The School of Data Science feature (supplied source 3) was removed from the homepage at the user's explicit request; its research notes and image are retained below for provenance. It uses event dates where verified; entries with `date_kind: report` use the publication date and are described as reports. English copy is an editorial translation of the verified Chinese sources. Original photos, portraits and posters are used without AI generation.

At the user's request, dates are displayed in a single readable line above the card title, alongside the category. The page no longer shows the small “报道日期 / Published” date-provenance label. `date_kind` remains in the data solely as a source-provenance record; this presentation change does not alter any date or the distinction between event dates and publication dates documented here.

Sources 1, 3, 5, 6, 7, 8, 9 and the newly supplied CCTA workshop article were read in the user's authorized browser. Source 2 was retrieved from Xinhua's public article endpoint and its official PDF attachment. Source 4 was read from the original article HTML. Image contents were checked visually before selection. Photographic identity associations come from the source's captions or adjacent article text, not from face matching.

## CCTA GEO × AI cross-border trade workshop — 2026-11-09

- Data ID: `ccta-geo-ai-workshop-2026`; newly supplied source added after the user requested removal of the School of Data Science feature.
- Original report: [跨境商学院 | AI出海专场 GEO×AI双引擎实战分享圆满收官](https://mp.weixin.qq.com/s/LykFnMvkk9sNV3HAePLAeA), published **2026-11-11**.
- Event: **the afternoon of 2026-11-09**, explicitly stated in the original article read in the user's browser. The card uses this event date, not the report date.
- Organizer: 长沙市跨境贸易协会. Venue: 湖南仁本律师事务所, Changsha.
- Workshop theme: “GEO×AI双引擎：内容获客+智能体落地”. The article identifies 夏钒曾 as the speaker of 《GEO，AI时代的品牌新资产》 and discusses semantic assets, AI brand recognition and recommendations, and overseas marketing.
- The card summarizes the verified subject matter only; it does not repeat statistics or quantitative claims that have not been independently checked.
- Image: `assets/media/events/ccta-geo-ai-workshop-2026.jpg`. [Original image 4](https://mmbiz.qpic.cn/mmbiz_jpg/515HhSHo6BaUjW11gxLZpr9fpM3y6qZDjQ26f3OjSVz6rxOpiauc4Y0hUVbBIFbgoicMia47TxWPbFIZn8puIWUiav7NJHoxwYnxibxiagYlFrEfo/640?wx_fmt=jpeg) was located in the 夏钒曾 presentation section through the article DOM. Visual inspection confirms a genuine presentation scene, with a speaker, audience and projected GEO material. The original is 1080 × 656; centered 16:9 framing retains the speaker's head and the presentation.

## Invited talk at the family education conference — 2026-11-08

- Data ID: `family-education-ai-growth-2026`; supplied source 1.
- [Original invitation](https://mp.weixin.qq.com/s?__biz=MjM5NzcwMTYyOA==&mid=2650608123&idx=2&sn=379e671b975f6bcdca828b6675fc171d): 第三届《中国梦·教育梦》2026新时代家庭教育发展大会, Changsha.
- The browser-verified conference dates are **November 7–9, 2026**. On **2026-11-17**, the user explicitly confirmed **November 8, 2026** as Fanzeng Xia's personal speaking date and supplied a photograph taken during the talk. The card now uses that single confirmed date, with no `date_end`.
- The linked source remains the original invitation, and the card retains its **受邀 / invited** wording. The user's confirmation and supplied on-site photograph establish the delivered talk and its date.
- Topic: 《AI跃迁时代的个人成长：探寻未来稀缺的竞争力》, as printed with 夏钒曾's name in the original invitation.
- Image: `assets/media/events/family-education-ai-growth-2026.jpg`, the **1440 × 1080 on-site photograph supplied by the user on 2026-11-17**. It shows the speaker on stage, an enlarged live view of the speaker, the presentation on personal core capabilities, and the audience. This photograph replaces the previously selected invitation poster. The original image is preserved; the card uses `image_position: center 65%` for its 16:9 framing and no longer uses `image_fit: contain`.
- The browser displayed publication on **2026-10-21** and modification on **2026-10-23**. Neither date is used as the event date.

## School of Data Science feature — reported 2026-08-28 — no longer displayed

- Former data ID: `sds-research-frontmind-feature-2026`; supplied source 3. **Removed from display at the user's explicit request.** The source notes and local image remain archived; the entry is absent from `data/events.yaml`.
- Original report: [院士授课、顶会论文、大厂就业，港中大（深圳）数据科学学院的AI实力有多强？](https://mp.weixin.qq.com/s?__biz=MzUxNTQ4NjQyNw==&mid=2247528774&idx=1&sn=24e5a285d91bc2ff110584fab0ff2db4), the School of Data Science's official account.
- **2026-08-28 is the publication date**, not a physical event date. The removed card was categorized as 学院报道 / School Feature and used `date_kind: report`.
- The article identifies 夏钒曾 as a 2023-entry doctoral student and FrontMind co-founder and CEO, describes research on large-model decision-making and applications, and connects the GEO venture FrontMind to the Intelligent Decision Laboratory.
- Image: `assets/media/events/sds-research-frontmind-feature-2026.jpg`. [Original portrait](https://mmbiz.qpic.cn/mmbiz_jpg/ghMvO5rvzdZlN9ibH86xfbdp0k95zTgh3VciazsEcSTibNcv23ibcibsWVibj3RbjZ4JXDvYvbawpicurzBoIfSLibicxc9CsRc5AeZibibBZfnqZMxETk/640?wx_fmt=jpeg).
- Identity association was verified from browser DOM order: image 15 → 李子牛, image 16 → 张雨舜, image 17 → 夏钒曾, image 18 → 蒋逸韬, image 19 → END. The earlier candidate image 23 was an ICML accomplishments banner and was rejected. Use `image_fit: contain` for the selected portrait.

## GEO trustworthy communication standard — 2026-08-11

- Data ID: `geo-trustworthy-standard-2026`.
- Original report: [国内首部GEO可信传播团体标准8月11日正式发布](https://my-h5news.app.xinhuanet.com/h5/article.html?articleId=202608123323a47bda40437f8a42ee135670ab2f), 新华网客户端.
- Publication: 2026-08-12 11:13:35, Asia/Shanghai. The public article endpoint returns `publishTime: 1786504415000`.
- Event: release of T/CAPT 026–2026 on **2026-08-11**. The opening paragraph says the expert review took place on August 9 and the standard was formally released on August 11.
- The [official standard PDF](https://xhsc.app.xinhuanet.com/cms/article/image/effde681006146f3aa151b6c3d90d10c.pdf) confirms `2026 - 08 - 11 发布` and `2026 - 08 - 12 实施` on its cover.
- Connection: the article identifies “香港中文大学（深圳）智能决策实验室” among more than 30 participating institutions. The PDF also lists the laboratory among drafting institutions. It does **not** list 夏钒曾 among principal drafters, so the card makes no individual authorship claim.
- Location: China. The article names Beijing as the **review** location; it does not specify a physical venue for the August 11 release.
- Image: `assets/media/events/geo-trustworthy-standard-2026.jpg`, rendered from page 1 of the official PDF above. The article has no photographs. This is an authentic document cover, not a photograph of the event; the alt text identifies it accordingly. At the user's request on 2026-11-17, the card displays the cover on a white background with enlarged framing focused on its central title.

## AI growth and commercialization exchange — 2026-07-08

- Data ID: `ai-industry-exchange-cuhksz-2026`; supplied sources 4 and 5, combined as one event.
- Original report: [产学研携手启新篇｜仁南健康集团旗下南讯智能正式与香港中文大学（深圳）达成战略合作暨AI专题交流会圆满落幕](https://mp.weixin.qq.com/s/PKQJZ8bz9W9JQdWqMaYmOg), 仁南健康集团.
- Publication: 2026-07-09 12:25:57, Asia/Shanghai. Source metadata: `create_time: '2026-07-09 12:25'`, `create_timestamp: '1783571157'`.
- Event: **July 8**, explicitly stated in the opening paragraph. The year 2026 is independently confirmed by the event announcement poster described below.
- Exact event wording: “7月8日，由阿里悟空、深圳市人工智能产业协会、香港中文大学（深圳）联合主办的「走进香港中文大学（深圳）——共探AI增长与AI产业化机遇」专题交流活动顺利举行。”
- Connection: the body states that 南讯智能 and the university's FrontMind 智能决策实验室 team established strategic collaboration. This report does not name Fanzeng Xia individually; the companion announcement identifies his invited talk.
- Location: CUHK-Shenzhen, Shenzhen, China.
- Image: `assets/media/events/ai-industry-exchange-cuhksz-2026.jpg`, the report's first photograph showing the event group and banner. [Original full-size photograph](https://mmecoa.qpic.cn/mmecoa_jpg/urllVamWoTC58yibSw05jGwkxSFTicMIKcEUAkvFn7Kudbm5KCYGkdbm5UrBFiaFKh1oV3OribcKQQQFra6eicSZrSBW9EnBJtD2vE1ggqhyRWBE/0?wx_fmt=jpeg). No AI imagery is used.
- Companion source 5: [【活动预告】走进香港中文大学（深圳）携手阿里悟空和深圳市人工智能产业协会共探AI增长与AI产业化机遇](https://mp.weixin.qq.com/s?__biz=MzkzNzE3NzIyNA==&mid=2247713289&idx=2&sn=6a1e3e27517d381d6414c971c86efc40), published **2026-06-30**. This URL is preserved as the card's `related_links` announcement.
- The [announcement poster](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cEKDZFbQX5bk7FVGGepVmGIenaEicuR046HK1Caudd9Z0OXHuafN3BibQpdN2ushibb1HqEHzc2LRBR7kPRlKcROMBtUkwGhmiaz9KeH1Yn7AE0/640?wx_fmt=jpeg&from=appmsg) explicitly states **2026年7月8日（周三）14:00**, location **香港中文大学（深圳）数据科学学院**, and 夏钒曾's topic **AI赋能企业品牌建设与增长转化**. The schedule assigns 夏博士分享 to 15:30–16:30. These details establish that sources 4 and 5 describe the same event. The card retains invitation wording for the specific talk.

## AI and Web3.0 at Wandong International Talent House — 2026-01-15

- Data ID: `wandong-ai-web3-trade-2026`; supplied source 6.
- Original report: [当AI遇见鸿蒙：湾东国际人才之家首秀，打造创意生态新引擎](https://mp.weixin.qq.com/s?__biz=MzI2ODE5MzgzMQ==&mid=2650621549&idx=3&sn=815acc58d4e4195bb6ea51c70afd77c6).
- Event: **2026-01-15**. Publication: **2026-01-16**. These dates were read from the original article in the browser.
- Location: 湾东国际人才之家, 龙城街道CC创意街区, Longgang, Shenzhen.
- Theme: “AI赋能创意，鸿蒙链接未来”. The article explicitly states that 夏钒曾 shared applications of AI and Web3.0 in cross-border trade and ideas for local creative products to reach overseas markets.
- Image: `assets/media/events/wandong-ai-web3-trade-2026.jpg`. [Selected original image 4](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mOiajweEnhxFvRibCLqwOaGIwYOiaSibcdcqZBWfQdBmusCa0AlHFhcasRqLKibek6hdYWiaUf8v2nYR9oPrjRaLcmGA/640?wx_fmt=jpeg&from=appmsg) shows the presentation and audience, with LinkRoad material visible on the screen. Image 3 showed 安菲翁科技 material and was not selected for this card.

## Innovate X Unicorn Advisory Board session — 2025-12-03

- Data ID: `innovate-x-linkroad-financing-2025`; supplied source 7.
- Original report: [独角兽私董会回顾｜AI+Web3.0，首轮融资路径与发展模式定向攻坚](https://mp.weixin.qq.com/s?__biz=Mzg5MjYzNjM4OA==&mid=2247513048&idx=1&sn=98fdf9e287e2dd5ad15d5a05927b0ddb).
- Event: **2025-12-03**. Publication: **2025-12-15**. These dates were read from the original article in the browser.
- The third Innovate X 独角兽私董会 was jointly organized by 香港中文大学（深圳）创新创业处 and 深圳数据经济研究院. It used Link Road 路链科技 as a case study to discuss AI + Web3.0 cross-border trade, initial financing and development models. Variant Fund's 金丽芸 contributed advice.
- The article does not directly name 夏钒曾. The card therefore describes the company case and session, without claiming a named individual role. A precise venue was not retained in the browser verification note, so the card omits a location badge.
- Image: `assets/media/events/innovate-x-linkroad-financing-2025.jpg`. [Original image 8](https://mmbiz.qpic.cn/mmbiz_jpg/kcXke1SnQwXqjjDDTtEVV0GjeLbeddbkQNqicb7iaUzWyhA37CUbUTCXdCylaMxA7EdpoCu2BSibzbpEvCtoJE17w/640?wx_fmt=jpeg&from=appmsg) is a genuine photograph from the session. Image 7 was the Link Road logo and was rejected in favor of the photograph. The alt text does not identify the pictured person.

## Innovation and entrepreneurship anniversary panel — reported 2025-11-20

- Data ID: `cide-tenth-anniversary-panel-2025`; supplied source 8.
- Original report: [【携手同行 双创筑梦】香港中文大学 (深圳) 创新创意创业中心举办十周年庆典暨深港青年创新创业论坛](https://mp.weixin.qq.com/s?__biz=MzA4NzYzNzQyMA==&mid=2652762058&idx=1&sn=b305adcf5deb49461dfdf8b27a4aa3f2).
- **2025-11-20 is the publication date.** The verified body does not supply an exact event date. The candidate main image is a group photograph, and date text on its small floor screens is not reliably legible even in the larger original. Consequently, this record has `date_kind: report`; no event date has been inferred.
- Location: 香港中文大学（深圳）会议楼II101宴会厅.
- The article identifies 夏钒曾, a 2023-entry doctoral student and founder of 路链科技, as a guest in the panel “双创共话：打通从校园到市场的最后一公里”. The card frames this as an anniversary report.
- Image: `assets/media/events/cide-tenth-anniversary-panel-2025.jpg`. [Original panel image 7](https://mmbiz.qpic.cn/mmbiz_jpg/Hd9Iaxs5WSjd6lMv4Hmk01ZRba3oH4YFyLAk1xavKwfvXicmpCF37vq4eLrGa4jxEZrV709PZSSTxIEzJUkOOgQ/640?wx_fmt=jpeg). Its backdrop explicitly carries this panel title and the name 夏钒曾. Image 8 shows a different panel, “双城对话：中大创业人的深港故事”, and was not selected.

## C Star African entrepreneurs' visit — 2025-09-19

- Data ID: `c-star-african-entrepreneurs-2025`; supplied source 9.
- Original report: [活动回顾｜跨越山海 共赴新程——招商局C Star计划非洲青年创业代表团来访港中大（深圳）](https://mp.weixin.qq.com/s?__biz=MzkwODYxOTU3NQ==&mid=2247486927&idx=1&sn=d45d82f14f8f04a81ef99723c5feae13).
- Event: **2025-09-19**. Publication: **2025-09-24**. These dates were read from the original article in the browser.
- Twenty-eight African entrepreneurs visited CUHK-Shenzhen. The article explicitly states that 夏钒曾 presented Link Road's progress, technology and development plans, and discussed topics including digital trade.
- Image: `assets/media/events/c-star-african-entrepreneurs-2025.jpg`. [Original image 11](https://mmbiz.qpic.cn/mmbiz_jpg/6QcTfQeaicicDcaOYfVlOt65zKo0fKNTOWV53awLjVicrDYAToicFCmiaqZITl9438ribfHByOhfYKYWoWgEiarHvCqRA/640?wx_fmt=jpeg) shows the presentation and visiting audience. The alt text describes the event scene rather than identifying participants from their faces.

## Remaining limits

- The precise event date of source 8 is unconfirmed; the card explicitly represents a report dated November 20.
- Source 3 is an institutional feature, not an in-person event, and is no longer displayed at the user's request.
- Source 1 records the invitation and conference date range; the user's confirmation and on-site photograph supplied on 2026-11-17 establish November 8 as the individual speaking date.
- Source 2 names the laboratory among drafting institutions; neither the article nor the standard's named principal-drafter list names 夏钒曾 individually.
- Sources 4 and 5 cover the same July 8 event and remain accessible through two separate links on one card.
