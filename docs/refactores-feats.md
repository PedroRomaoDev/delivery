assim como o POST de delivery address sobrescreve o ultimo POST (se ja tiver um)
quero adicionar esse comportamento ao POST de payments, para que o ultimo POST de payment seja o unico a ser considerado,
sobrescrevendo o existente (se tiver)
-> Antes: POST de payment lançava erro se já existisse um payment
-> Agora: POST de payment sobrescreve o payment existente (como o delivery address)
-> Agora pode fazer varios POST para /orders/:id/payments e cada novo POST substituirá o payment anterior.

---

Para add payment precisa ter items adds
and
para add delivery address precisa ter payment add

So ai o objeto esta completo, obrigando o usuario a seguir os steps


---


adicionar deleção de item

adicionar cancelamento de pedido (delete)
