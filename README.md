## Ghosts

This is a JavaScript implementation of the board game "Phantoms vs Phantoms",
also known as "Geister".
https://boardgamegeek.com/boardgame/2290/phantoms-vs-phantoms

Notice that the "Geister" and "Phantoms vs Phantoms" rulesets differ in
one major way: In "Geister" the board is 6x6 and you're trying to exit
the board by moving _off_ of one of the corners.
In "PvP" the board is effectively "6x6 with the corners cut off,"
and you're trying to exit that truncated board by moving _into_
one of the corners (which are never inhabited during the game proper).
I find the "PvP" rules easier to teach, slightly quicker to play,
and certainly easier to make the UI for, so that's what I've
implemented here.

The AI player is currently based on the paper "Developing geister algorithms without machine learning"
("機械学習を用いないガイスターの行動アルゴリズム開発") by Koki Suetsugu and Yusuke Orita.
It is not very strong compared to a human player.

Play versus the AI by [clicking here](https://quuxplusone.github.io/Ghosts).


## Reading list

- **[braathwaate/stratego](https://github.com/braathwaate/stratego)**
    (advanced player for Stratego, in English and Java).

- **[matsu7874/geister](https://github.com/matsu7874/geister)**
    (Monte Carlo player for PvP, in Python).

- **[miyo/geister.js](https://github.com/miyo/geister.js)**
    (stub player for Geister, in JavaScript).
    This UI is used in the annual ["Geister AI Tournament"](http://www2.matsue-ct.ac.jp/home/hashimoto/geister/GAT/)
    organized since 2017 by Tsuyoshi Hashimoto.

- ["Enhancing Artificial Intelligence in Games by Learning the Opponent’s Playing Style"](https://link.springer.com/content/pdf/10.1007%2F978-0-387-09701-5_1.pdf)
    (Fabio Aiolli, Claudio Enrico Palazzi; 2008).
    Reprinted as ["Enhancing Artificial Intelligence on a Real Mobile Game"](https://www.hindawi.com/journals/ijcgt/2009/456169/) (2009).

- ["Acquiring Strategies for the Board Game Geister by Regret Minimization"](https://www.semanticscholar.org/paper/33ec5c1d0d9823c13e5561f584147ecd2150aa85)
    (Chen Chen, Tomoyuki Kaneko; 2019; no full text available).

- ["Amelioration of artificial intelligence using game techniques for an imperfect information board game geister"](https://www.researchgate.net/publication/289050582)
    (S. Balakrishnan, K.L. Shunmuganathan, Raja Sreenevasan; 2014)

- ["Developing geister algorithms without machine learning"](https://ipsj.ixsq.nii.ac.jp/ej/?action=repository_action_common_download&item_id=186127&item_no=1&attribute_id=1&file_no=1)
    (Koki Suetsugu, Yusuke Orita; 2018; full text in Japanese).
