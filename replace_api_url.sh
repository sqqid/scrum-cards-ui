find '/usr/share/nginx/html' -name '*.js' -exec sed -i -e 's,api_base_url,'"$api_base_url"',g' {} \;
nginx -g "daemon off;"

