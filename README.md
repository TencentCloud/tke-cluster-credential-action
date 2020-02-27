# tke-cluster-credential-action
Retrieve TKE cluster credential and set it to `$HOME/.kube/config`.

## Inputs

### `secret_id`

**Required** Tencent Cloud secret id. Should be referred to a encrypted environment variable.

### `secret_key`

**Required** Tencent Cloud secret key. Should be referred to a encrypted environment variable.

### `tke_region`

**Required** TKE bucket region.

### `cluster_id`

**Required** TKE cluster id.

## Example usage

```
uses: TencentCloud/tke-cluster-credential-action@master
with:
  secret_id: ${{ secrets.TENCENT_CLOUD_SECRET_ID }}
  secret_key: ${{ secrets.TENCENT_CLOUD_SECRET_KEY }}
  tke_region: ${{ secrets.TKE_REGION }}
  cluster_id: ${{ secrets.TKE_CLUSTER_ID }}
```