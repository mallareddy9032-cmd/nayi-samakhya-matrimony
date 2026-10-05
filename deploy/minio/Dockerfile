# One-shot bucket/user setup. The MinIO images are distroless (no shell), so mc is copied onto a
# small base that can run the script. Local stack only; production provisions storage separately.
FROM cgr.dev/chainguard/minio-client@sha256:b20bdc339b3f2596c8f731793f861d2445fd13a9a3cfb517ff020969f4e4bf71 AS mc
FROM node:24-alpine
COPY --from=mc /usr/bin/mc /usr/bin/mc
COPY init.sh app-policy.json /minio/
USER node
ENTRYPOINT ["sh", "/minio/init.sh"]
