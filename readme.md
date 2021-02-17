# Vef2 2021, verkefni 2

Keyrsla á verkefninu localhost -> npm install -> npm run build -> npm run start.

Keyrsla er sýnileg á Heroku á linknum: https://vef2-2021-sot-v2.herokuapp.com/


[Kynning í fyrirlestri](https://www.youtube.com/watch?v=1kRJBE040oY).

Verkefnið snýst um að útbúa einfaldan undirskriftarlista með skráningu og birtingu skráninga.

Fyrst

## Útlit

Titill síðu er „Undirskriftarlisti“.

Form er birt fyrst og skal vera responsive:

* Nafn, required
* Kennitala, required, placeholder skal vera `000000-0000`
* Birta nafn á lista, checkbox sem er sjálfgefið af
* Athugasemd, textarea
* Skrifa undir, takki til að senda inn

Ef villur koma upp skal birta þær fyrir neðan formið og merkja viðeigandi reit í forminu.

**Skjáskjot af dæmi af útliti kemur inn vonbráðar**.

## Gagnagrunnur

Í rót verkefnis er skráin `./schema.sql` sem inniheldur skilgreiningu á töflu.

Gagnagrunnur ætti að heita `vef2-2021-v2` og hægt er að búa hann til með `createdb` CLI skipun eða í gegnum pgAdmin.

Lesa skal tengingu við gagnagrunn í gegnum `DATABASE_URL` streng sem sett er í `.env` skrá. Þessi skrá á ekki að vera í git, hún er skilgreind í `.gitignore`. Sjá dæmi í `.env.example`.

## Uppsetning á Heroku

Setja skal verkefnið upp á Heroku. Þar þarf að:

* útbúa aðgang á heroku.com
* setja verkefni á GitHub
* búa til „app“ á heroku
  * tengja GitHub repo við app
  * setja upp heroku postgres
* tengja repo við heroku með `heroku git:remote -a app-nafn`
* pusha repo frá CLI, eða setja upp „auto deploy“ og keyra manual deploy innan heroku
* keyra one-time script til að búa til gagnagrunn

## Útfærsla

Setja þarf upp þ.a. express geti tekið við post gögnum frá formi og þau síðan vistuð í gagnagrunn. Það þarf að staðfesta (validate) og hreinsa (sanitize) gögn:

* Nafn er krafist, svo a.m.k. einn stafur
* Kennitölu er krafist, `000000-0000` eða `0000000000` form, santized yfir á `0000000000` form
* Birta nafn á lista, boolean gildi
* Athugasemd, ekki krafist

Einnig þarf að passa upp á að XSS eða SQL injection sé ekki til staðar.

Til að komast að villum í forminu er gott að nota hjálparfall til að athuga villufylki frá `validation`

Ekki þarf að útfæra síðuflettingu (e. paging), *allar* skráningar eru sýndar í einu. Ef þetta væri gert í „alvöru“ verkefni þyrfti að útfæra þannig, þar sem ef við höfum hundruðir skráninga, myndum við þurfa að senda mikið af gögnum frá bakenda til framenda.

Nóg er að láta villu frá gagnagrunni segja til um hvort kennitala sé skráð.

Ekki þarf að staðfesta að kennitala sé rétt m.t.t. vartölu.

## Tæki og tól

Verkefnið skal innihalda `package.json` og `package-lock.json` sem innihalda öll notuð tól.

Setja skal upp `eslint` til að linta JavaScript kóða, gefin er `.eslintrc.js` skrá.

Þegar verkefni er metið er keyrt í röð:

* Gagnagrunnur búinn til
* `DATABASE_URL` er sett í `.env`
* `npm install` keyrt fyrst sem sækir öll dependency
* `npm run setup`, keyrir setup á gagnagrunn, sjá að ofan
* `npm start` á að keyra upp express vefþjón á porti `3000`
* `npm test` sem á að keyra eslint og stylelint, og sýna engar villur

## Mat

* 10% – Snyrtilegur kóði, engar villur þegar npm test er keyrt
* 10% – Skema fyrir gagnagrunn sett upp og leiðbeiningum fylgt um uppsetningu á verkefni
* 20% – Útlit uppsett eftir forskrift, merkingarfræðilegt HTML og snyrtilegt CSS
* 30% – Form til að skrá sig á undirskriftalista: validation, sanitazion, skrifað í gagnagrunn
* 10% - Síðan sýnir skráningar úr gagngagrunni
* 20% – Verkefni sett upp á Heroku

## Sett fyrir

Verkefni sett fyrir í fyrirlestri fimmtudaginn 28. janúar 2021. Sett fyrir í raun 2. feb á Canvas.

## Skil

Skila skal í Canvas í seinasta lagi fyrir lok dags miðvikudaginn 11. febrúar 2021.

Skilaboð skulu innihalda slóð á GitHub repo fyrir verkefni, og dæmatímakennurum skal hafa verið boðið í repo ([sjá leiðbeiningar](https://docs.github.com/en/free-pro-team@latest/github/setting-up-and-managing-your-github-user-account/inviting-collaborators-to-a-personal-repository)). Notendanöfn þeirra eru:

* `jonnigs`
* `mimiqkz`
* `Steinalicious`
* `zurgur`

Hver dagur eftir skil dregur verkefni niður um 10%, allt að 20% ef skilað laugardaginn 14. febrúar 2020 en þá lokar fyrir skil.

## Einkunn

Sett verða fyrir 6 minni verkefni þar sem 5 bestu gilda 8% hvert, samtals 40% af lokaeinkunn.

Sett verða fyrir tvö hópverkefni þar sem hvort um sig gildir 10%, samtals 20% af lokaeinkunn.

---

> Útgáfa 0.1
