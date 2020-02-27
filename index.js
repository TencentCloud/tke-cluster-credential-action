const core = require('@actions/core');
const github = require('@actions/github');
const tencentcloud = require("tencentcloud-sdk-nodejs");
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const os = require('os');

const retrieveClusterCredential = async (tke) => {
    const TkeClient = tencentcloud.tke.v20180525.Client;
    const models = tencentcloud.tke.v20180525.Models;

    const Credential = tencentcloud.common.Credential;
    const cred = new Credential(tke.secretId, tke.secretKey);

    const client = new TkeClient(cred, tke.region);

    const req = new models.DescribeClusterSecurityRequest();
    req.ClusterId = tke.clusterId;

    return new Promise((resolve, reject) => {
        client.DescribeClusterSecurity(req, (err, data) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    })
}

const generateKubeConfig = (clusterId, clusterCredential) => {
    const contextName = clusterId + '-context-default';
    const userName = clusterId + '-admin';

    const config = {
        apiVersion: 'v1',
        clusters: [
            {
                cluster: {
                    'certificate-authority-data': Buffer.from(clusterCredential.CertificationAuthority).toString('base64'),
                    server: 'https://' + clusterCredential.Domain
                },
                name: clusterId
            }
        ],
        contexts: [
            {
                context: {
                    cluster: clusterId,
                    user: userName
                },
                name: contextName
            }
        ],
        'current-context': contextName,
        kind: 'Config',
        preferences: {},
        users: [
            {
                name: userName,
                user: {
                    token: clusterCredential.Password
                }
            }
        ]
    };
    return YAML.stringify(config)
}


const process = async (tke) => {
    const credential = await retrieveClusterCredential(tke);
    const kubeConfig = generateKubeConfig(tke.clusterId, credential);
    await fs.promises.mkdir(path.join(os.homedir(), '.kube'), {recursive: true, mode: 0o700});
    await fs.promises.writeFile(path.join(os.homedir(), '.kube/config'), kubeConfig, {mode: 0o600});

    console.log(`finish saving TKE config to '$HOME/.kube/config'.`);
}

try {
    const tke = {
        secretId: core.getInput('secret_id'),
        secretKey: core.getInput('secret_key'),
        region: core.getInput('tke_region'),
        clusterId: core.getInput('cluster_id')
    };

    process(tke).catch((reason) => {
        core.setFailed(`fail to get cluster credentials: ${reason}`);
    });
} catch (error) {
    core.setFailed(error.message);
}