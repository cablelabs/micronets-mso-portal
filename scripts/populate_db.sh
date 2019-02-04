#!/usr/bin/env bash

#!/usr/bin/env bash

MSO_PORTAL_HOSTNAME='http://127.0.0.1:3210'
MM_HOSTNAME='http://127.0.0.1:3030'

echo 'Getting Authorization token from ' $MSO_PORTAL_HOSTNAME

TOKEN=$(curl -s -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' --data-binary @./data/tokenPost.json http://${MSO_PORTAL_HOSTNAME}/portal/registration/token | jq -r '.accessToken')
JWT_TOKEN="Bearer ${TOKEN}"

echo ' JWT Token : ' $JWT_TOKEN

#! DELETE EXISTING SUBSCRIBERS CURL

echo ' Deleting existing subscribers on ' $MSO_PORTAL_HOSTNAME

SUBSCRIBERS=$(curl -s -X DELETE -H 'Accept: application/json' -H 'Content-Type: application/json'  http://${MSO_PORTAL_HOSTNAME}/internal/subscriber )

echo ' Existing Subscribers : ' ${SUBSCRIBERS}

#! POST SUBSCRIBER CURL

echo ' Populating subscriber on ' $MSO_PORTAL_HOSTNAME

SUBSCRIBER=$(curl -s -X POST -H 'Accept: application/json' -H 'Content-Type: application/json' --data-binary @./data/subscriberPost.json http://${MSO_PORTAL_HOSTNAME}/internal/subscriber )

echo ' Subscriber : ' ${SUBSCRIBER}