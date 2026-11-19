import certifi

from app.database import create_mongo_client


def test_mongo_uses_ca_for_tls_but_preserves_local_and_custom_connections(monkeypatch):
    calls = []

    def client(uri, **options):
        calls.append(options)
        return object()

    monkeypatch.setattr('app.database.MongoClient', client)
    create_mongo_client('mongodb+srv://user:fake@cluster.example.test/')
    assert calls[-1]['tlsCAFile'] == certifi.where()
    assert calls[-1]['serverSelectionTimeoutMS'] == 5000
    create_mongo_client('mongodb://localhost:27017')
    assert 'tlsCAFile' not in calls[-1]
    create_mongo_client('mongodb://cluster.example.test/?tls=true')
    assert calls[-1]['tlsCAFile'] == certifi.where()
    create_mongo_client('mongodb+srv://cluster.example.test/?tlsCAFile=custom.pem')
    assert 'tlsCAFile' not in calls[-1]
    create_mongo_client('mongodb+srv://cluster.example.test/', tlsCAFile='custom.pem')
    assert calls[-1]['tlsCAFile'] == 'custom.pem'
    assert 'tlsAllowInvalidCertificates' not in calls[-1]
    create_mongo_client('mongodb+srv://cluster.example.test/?tls=false')
    assert 'tlsCAFile' not in calls[-1]
