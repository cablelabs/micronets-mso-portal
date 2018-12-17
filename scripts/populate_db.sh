#!/usr/bin/env bash

#!/usr/bin/env bash

MSO_PORTAL_HOSTNAME='nccoe-mso-api.micronets.in'
MM_HOSTNAME='nccoe-mm-api.micronets.in'

echo 'Getting Authorization token from ' $MSO_PORTAL_HOSTNAME

TOKEN=$(curl -s -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' --data-binary @./data/tokenPost.json http://${MSO_PORTAL_HOSTNAME}/portal/registration/token | jq -r '.accessToken')
JWT_TOKEN="Bearer ${TOKEN}"

echo ' JWT Token : ' $JWT_TOKEN

#! POST SUBSCRIBER CURL

echo ' Populating subscriber on ' $MSO_PORTAL_HOSTNAME

SUBSCRIBER=$(curl -s -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' --data-binary @./data/subscriberPost.json http://${MSO_PORTAL_HOSTNAME}/internal/subscriber )

echo ' Subscriber : ' ${SUBSCRIBER}