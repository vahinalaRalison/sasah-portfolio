FROM nginx:1.27-alpine

# Le point d'entrée de l'image nginx rend les templates de /etc/nginx/templates avec envsubst.
ENV RESOLVER=127.0.0.11 \
    NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY proxy_params.conf   /etc/nginx/proxy_params.conf

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://127.0.0.1/api/profile/health || exit 1
