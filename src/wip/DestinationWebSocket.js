export default class DestinationWebSocket {
    constructor(uri, {
        protocol = "ws",
        port = null,
        endpoint = null
    } = {}) {
        this.url = `${ protocol }://${ uri }${ port ? `:${ port }` : null }/${ endpoint }`;
    }
}