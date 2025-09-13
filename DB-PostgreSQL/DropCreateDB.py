import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_NAME = "ml_heroes"
DB_USER = "postgres"
DB_PASSWORD = "12345678"  # Change to your actual password
DB_HOST = "localhost"
DB_PORT = "5432"

def drop_create_database():
    # Connect to default database
    conn = psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    # Disconnect all active connections to the target database
    cur.execute(f"""
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '{DB_NAME}' AND pid <> pg_backend_pid();
    """)

    # Drop database if exists
    cur.execute(f"DROP DATABASE IF EXISTS {DB_NAME};")
    # Create database
    cur.execute(f"CREATE DATABASE {DB_NAME} WITH ENCODING 'UTF8' OWNER {DB_USER};")

    cur.close()
    conn.close()
    
def create_heroes_table():
    # Connect to the new database
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

    # Create table
    cur.execute("""
        CREATE TABLE heroes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            image_url VARCHAR(150),
            description VARCHAR(150)
        );
    """)

    # Insert sample data
    cur.execute("""
        INSERT INTO heroes (name, image_url, description) VALUES
        ('Gloo', 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage_1_9_642/100_8b401d50920f2359060a9c7a3c833df1.png', 'A mysterious creature that can split into many smaller ones.'),
        ('Lukas', 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage_1_9_20/100_454c13b2de7b7d1a20fbf553c620510d.png', 'A legendary Sacred Beast that can take the form of a ranbunctious young man.'),
        ('Nolan', 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_0495066df0d828c149e7fe89aa63078b.png', 'A scholar that wanders the universe with split souls to save his daughter.'),
        ('Zhuxin', 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage_92/100_13cfeec4bec7a27a09677e519f1ef9d2.png', 'A mysterious young woman who guides the ember butterflies using her Lantern ...'),
        ('Hanabi', 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_85d213390613bbc09220cf1d9f64c5c0.png', 'Leader of the Scarlet Sect, in the Scarlet Shadow of the Cadia Riverlands.'),
        ('Lesley', 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_f4f42410c90f84e4d46b129d5e8887e8.png', 'Adopted daughter of House Vance, a clandestine sniper.');
    """)

    conn.commit()
    cur.close()
    conn.close()    
    
def create_roles_table():
    # Connect to the new database
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

    # Create table
    cur.execute("""
        CREATE TABLE roles (
            id SERIAL PRIMARY KEY,
            role VARCHAR(50),
            logo_url VARCHAR(150),
            primary_function VARCHAR(150),
            key_attributes VARCHAR(150)
        );
    """)

    # Insert sample data
    cur.execute("""
        INSERT INTO roles (role, logo_url, primary_function, key_attributes) VALUES
        ('Tank', 'https://static.wikia.nocookie.net/mobile-legends/images/f/f0/Tank_Icon.png', 'Protect teammates, soak damage, and initiate team fights.', 'High health, defense, and crowd control.'),
        ('Fighter', 'https://static.wikia.nocookie.net/mobile-legends/images/1/1a/Fighter_Icon.png', 'Balance damage and durability, capable of engaging in fights and soaking damage.', 'Balanced stats, good damage output, and decent survivability.'),
        ('Assassin', 'https://static.wikia.nocookie.net/mobile-legends/images/3/3f/Assassin_Icon.png', 'Quickly eliminate enemy heroes in team fights.', 'High burst damage, mobility, and stealth.'),
        ('Mage', 'https://static.wikia.nocookie.net/mobile-legends/images/5/53/Mage_Icon.png', 'Deal high magic damage, often with range and crowd control.', 'High magic power, magical damage, and often crowd control.'),
        ('Marksman', 'https://static.wikia.nocookie.net/mobile-legends/images/1/10/Marksman_Icon.png', 'Deal high physical damage, primarily from a distance.', 'High attack speed, physical damage, and ranged attack.');
    """)

    conn.commit()
    cur.close()
    conn.close()    

def create_hero_roles_table():
    # Connect to the new database
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

    # Create table
    cur.execute("""
        CREATE TABLE hero_roles (
            id SERIAL PRIMARY KEY,
            hero_id INT NOT NULL,
            role_id INT NOT NULL
        );
    """)

    # Insert sample data
    cur.execute("""
        INSERT INTO hero_roles (hero_id, role_id) VALUES
        (1, 1),
        (2, 2),
        (3, 3),
        (4, 4),
        (5, 5),
        (6, 3),
        (6, 5);
    """)
    
    # Add foreign key constraints
    cur.execute("""
        ALTER TABLE hero_roles
        ADD CONSTRAINT fk_hero_id FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE;
    """)
    cur.execute("""
        ALTER TABLE hero_roles
        ADD CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES roles(id);
    """)

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    drop_create_database()
    create_heroes_table()
    create_roles_table()
    create_hero_roles_table()