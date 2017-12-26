title: Delegators and forging of Asch
---

Each account in Asch system can be registered as a delegator (100XAS is payable).

A delegator can accept any votes from coin holders. When the rate of vote reaches into top 101,
the delegators can obtain the right to account(that is, the right of block production, which is
equivalent to miners in Bitcoin. ) and get certain reward. The process of block production is
called forging.

Forging does not need strong computing power like Bitcoin mining. Even the ordinary computer
can be carried out to verify the algorithm of accounting right, which combines time slice
verification, delegators random ranking, delegators signatures and pbft algorithm. More
details refer to Asch consensus agreement. The delegators of top 101 are in turn to produce
blocks in chronological order with a block interval of 10 seconds.When delegators in turn can
not produce blocks because of exceptions, it will  be postponed to next 10 seconds and produce
by the next delegator.

Each 101 blocks as a cycle, forging order of the delegators will be random changed  in each cycle.
When the last block is produced, the benefit will be settled in this cycle and the ranking will
also be refreshed.
If delegators can not produce blocks because of the downtime, network errors and other reasons,
they can not only get the benefits of the cycle, but also reduce productivity. Productivity is
an indicator of the stability of a delegator, and lower productivity will  affect the vote.

The delegators of the normal block production divide the benefit equally, including block rewards
and transaction fees. The rankings and the votes do not affect the amount of the benefit. The benefit
rate of the top 101 delegators is the same.

# 1 Block rewards

Block rewards will decrease over time, and the specific time will be based on the height of a future block.
The block rewards of Asch system  start from the beginning of 464500 block. The initial reward is 3.5 coins.
Every 3 million block decreases once and it lasts about 1 year.
After 15464500 block, the reward is no longer decreasing and each year has slightly less than 1.5% inflation rate.

The following are the various stages of the block reward

|reward|initial height|end height|
|-----|------|-------|
|3.5|464500|3464500|
|3|3464500|6464500|
|2.5|6464500|9464500|
|2|9464500|12464500|
|1|12464500|15464500|
|0.5|15464500|---|

# 2 transaction fee

In addition to the block rewards, the delegators can obtain the system transaction fee, or the handling fee.
The handling fee has the following kinds.


|type|fee|
|----|---|
|transaction|0.1|
|vote|0.1|
|the second password|5|
|registed delegator|100|
|registed dapp|100|
|dapp deposit|0.1|
|dapp withdraw|0.1|
|multiple signatures|(n+1)*0.5|
|small file storage (not yet online)|(size / 200 + 1) * 0.1|
