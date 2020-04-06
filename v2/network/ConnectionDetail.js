export default class ConnectionDetail {
    constructor({ host, port, protocol, route } = {}) {
        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.route = route;
    }

    get() {
        let host = this.host;
        let port = this.port ? `:${ this.port }` : null;
        let endpoint = this.endpoint ? `${ this.endpoint }` : null;

        return `${ this.protocol }://${ host }${ port }/${ endpoint }`;
    }

    getUri() {
        let host = this.host;
        let port = this.port ? `:${ this.port }` : null;
        let endpoint = this.endpoint ? `${ this.endpoint }` : null;

        return `${ host }${ port }/${ endpoint }`;
    }
}