from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, Product
import time
from sqlalchemy.exc import OperationalError

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)

# Wait for PostgreSQL and create tables
with app.app_context():
    max_retries = 10
    retry_delay = 5

    for attempt in range(max_retries):
        try:
            db.create_all()
            print("Connected to PostgreSQL.")
            break

        except OperationalError:
            print(
                f"Database not ready (attempt {attempt + 1}/{max_retries}). "
                f"Retrying in {retry_delay} seconds..."
            )
            time.sleep(retry_delay)

    else:
        raise Exception("Could not connect to PostgreSQL after multiple attempts.")


# Home Route
@app.route("/")
def home():
    return {"message": "Product Catalog Backend Running"}


# Health Check
@app.route("/health", methods=["GET"])
def health():
    return {
        "status": "healthy"
    }, 200


# Get All Products
@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])


# Add Product
@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "Invalid or missing JSON body"}), 400

    required = ["name", "category", "price", "stock"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        price = float(data["price"])
        stock = int(data["stock"])
    except (ValueError, TypeError):
        return jsonify({"message": "Price must be a number and stock must be an integer"}), 400

    product = Product(
        name=data["name"],
        category=data["category"],
        price=data["price"],
        stock=data["stock"]
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "message": "Product added successfully!"
    }), 201


# Update Product
@app.route("/api/products/<int:id>", methods=["PUT"])
def update_product(id):
    product = db.session.get(Product, id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    data = request.get_json(silent=True)

    if not data:
        return jsonify({"message": "Invalid or missing JSON body"}), 400

    required = ["name", "category", "price", "stock"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        price = float(data["price"])
        stock = int(data["stock"])
    except (ValueError, TypeError):
        return jsonify({"message": "Price must be a number and stock must be an integer"}), 400

    product.name = data["name"]
    product.category = data["category"]
    product.price = data["price"]
    product.stock = data["stock"]

    db.session.commit()

    return jsonify({
        "message": "Product updated successfully!"
    })


# Delete Product
@app.route("/api/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    product = db.session.get(Product, id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({
        "message": "Product deleted successfully!"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
