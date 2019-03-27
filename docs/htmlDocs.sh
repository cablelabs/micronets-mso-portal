#!/usr/bin/env bash
#! Script file to generate HTML docs from swagger docs.See [here](https://github.com/yousan/swagger-yaml-to-html)

#! Delete existing html docs
rm -rf ./html/MSO_PORTAL.html

#! Regenerate HTML docs
docker run -i yousan/swagger-yaml-to-html < ./swagger/MSO_PORTAL.yaml > ./html/MSO_PORTAL.html
