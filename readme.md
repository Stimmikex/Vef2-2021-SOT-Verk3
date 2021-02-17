# Vefforritun 2, 2021, verkefni 3

Framhald af [verkefni 2](https://github.com/vefforritun/vef2-2021-v2).

[Vídeó yfirferð](https://youtu.be/GW-mbrG5dEs).

Bæta skal við:

* 500 gervigögnum í byrjun
* „Síðum“ þegar undirskriftir eru skoðaðar
* Innskráningarkerfi
* Möguleika á að eyða færslum ef viðkomandi er innskráður notandi

[Sjá skjáskot af útliti](./utlit).

Verkefni skal sett upp á *öðru* Heroku appi.

Gefinn er grunnur, byggður á sýnilausn. Ekki er krafa um að nota hann.

## Gervigögn

Nota skal [`faker`](https://github.com/Marak/Faker.js) til að útbúa a.m.k. 500 gerviskráningar á listann:

* Nafn með `faker.name.findName()`
* Sérútfærsla á kennitölu sem nýtir `Math.random()`
* Athugasemd með 50% líkum með `faker.lorem.sentence()`
* 50% líkum á að vera nafnlaust
* Undirskrift hafi verið bætt við á seinustu tveim vikum

## Síðufletting

Þar sem mikið af gögnum er nú komið í gagnagrunninn okkar þurfum við síðuflettingu. Hver „síða“ skal vera 50 færslur. Fyrir neðan töflu skal birta flettingu, þar sem:

* Hægt er að fara til baka ef maður er ekki á fyrstu síðu
* Hægt er að fara á næstu síðu ef síða sem viðkomandi er á er með 50 skráningum
* Birt er á hvaða síðu viðkomandi er og heildarfjölda

Einnig skal birta fyrir ofan töflu heildarfjölda færsla, hægt er að telja með `SELECT COUNT(*) AS count FROM signatures;`

## Innskráning

Útfæra skal innskráningarkerfi með `passport` og `passport-local`. Ekki þarf að setja upp nýskráningu en nota skal töflu í postgres grunni til að geyma notendanafn og lykilorð. Lykilorð skal vista með `bcrypt`.

Ef farið er á `/admin` skal birta innsrkáningarsíðu sem birtir villuskilaboð ef innsrkáning gengur ekki upp. Ef innskráning gengur upp skal birta:

* að viðkomandi sé skráður inn og möguleika á að skrá sig út
* lista af færslum með möguleika á að eyða færslum
## Færslum eytt

Ef notandi er innskráður skal birta nýjan dálk í lista með takka sem leyfir að eyða færslunni.

Athuga þarf hvort notandi sé virkilega innskráður þegar það er reynt, annars redirect á login síðu.

Ef færslu er eytt skal redirecta á forsíðu bakvinnslu.

Ef villa kemur upp skal sýna villusíðu.

## Tæki og tól

Sama gildir og í verkefni 2 með tæki og tól, nema þegar `npm run setup` er keyrt skulu gervigögn búin til.

## Mat

* 10% – Snyrtilegur kóði, engar villur þegar npm test er keyrt
* 10% – Verkefni sett upp á Heroku
* 20% – Gervigögn búin til og sett í töflu
* 20% – Síðuflettingar og upplýsingar um síður
* 20% – Innskráningarkerfi útfært og sjálfgefinn notandi
* 20% – Eyðsla á færslum ef innskráður notandi

## Sett fyrir

Verkefni sett fyrir á Canvas sunnudaginn 14. febrúar 2021.

## Skil

Skila skal í Canvas í seinasta lagi fyrir lok dags laugardaginn 27. febrúar 2021.

Skilaboð skulu innihalda slóð á GitHub repo fyrir verkefni, og dæmatímakennurum skal hafa verið boðið í repo ([sjá leiðbeiningar](https://docs.github.com/en/free-pro-team@latest/github/setting-up-and-managing-your-github-user-account/inviting-collaborators-to-a-personal-repository)). Notendanöfn þeirra eru:

* `jonnigs`
* `mimiqkz`
* `Steinalicious`
* `zurgur`

Hver dagur eftir skil dregur verkefni niður um 10%, allt að 20% ef skilað mánudaginn 1. mars 2021 en þá lokar fyrir skil.

## Einkunn

Sett verða fyrir 6 minni verkefni þar sem 5 bestu gilda 8% hvert, samtals 40% af lokaeinkunn.

Sett verða fyrir tvö hópverkefni þar sem hvort um sig gildir 10%, samtals 20% af lokaeinkunn.

---

> Útgáfa 0.1
